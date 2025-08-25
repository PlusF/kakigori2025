import { NextApiRequest, NextApiResponse } from "next";

const TOKYO_AREA_CODE = "130010"; // 東京地方のコード

interface Area {
  name: string;
  code: string;
}

interface TimeSeriesArea {
  area: Area;
  weatherCodes?: string[];
  weathers?: string[];
  winds?: string[];
  waves?: string[];
  pops?: string[];
  temps?: string[];
  tempsMin?: string[];
  tempsMinUpper?: string[];
  tempsMinLower?: string[];
  tempsMax?: string[];
  tempsMaxUpper?: string[];
  tempsMaxLower?: string[];
  reliabilities?: string[];
}

interface TimeSeries {
  timeDefines: string[];
  areas: TimeSeriesArea[];
}

interface TempAverage {
  areas: Array<{
    area: Area;
    min: string;
    max: string;
  }>;
}

interface PrecipAverage {
  areas: Array<{
    area: Area;
    min: string;
    max: string;
  }>;
}

interface JMAForecast {
  publishingOffice: string;
  reportDatetime: string;
  timeSeries: TimeSeries[];
  tempAverage?: TempAverage;
  precipAverage?: PrecipAverage;
}

interface WeatherData {
  date: string;
  dateLabel: string;
  weather: string;
  weatherCode?: string;
  temperature?: {
    min: string;
    max: string;
  };
  precipitationProbability?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      `https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json` // 東京都全体のコード
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = (await response.json()) as JMAForecast[];

    const targetDates = ["2025-09-13", "2025-09-14"];
    const weatherData: WeatherData[] = [];

    for (const forecast of data) {
      if (forecast.timeSeries && forecast.timeSeries.length > 0) {
        const timeSeries = forecast.timeSeries[0];
        const area = timeSeries.areas.find(
          (a) => a.area.code === TOKYO_AREA_CODE
        );

        if (area && timeSeries.timeDefines) {
          for (let i = 0; i < timeSeries.timeDefines.length; i++) {
            const date = timeSeries.timeDefines[i].split("T")[0];

            if (targetDates.includes(date)) {
              const weather = area.weathers?.[i]?.replace(/\s+/g, '') || "不明";
              const weatherCode = area.weatherCodes?.[i];

              const existingDay = weatherData.find((d) => d.date === date);
              if (!existingDay) {
                const newDay = {
                  date: date,
                  dateLabel:
                    date === "2025-09-13" ? "9月13日（土）" : "9月14日（日）",
                  weather: weather,
                  weatherCode: weatherCode,
                };
                weatherData.push(newDay);
              }
            }
          }
        }

        if (forecast.timeSeries.length > 1) {
          const tempSeries = forecast.timeSeries[1];
          const tempArea = tempSeries.areas.find(
            (a) => a.area.code === TOKYO_AREA_CODE
          );

          if (tempArea && tempSeries.timeDefines) {
            for (let i = 0; i < tempSeries.timeDefines.length; i++) {
              const date = tempSeries.timeDefines[i].split("T")[0];

              if (targetDates.includes(date)) {
                const existingDay = weatherData.find((d) => d.date === date);
                if (existingDay) {
                  if (tempArea.pops) {
                    existingDay.precipitationProbability = tempArea.pops.slice(
                      i * 4,
                      (i + 1) * 4
                    );
                  }
                }
              }
            }
          }
        }

        if (forecast.timeSeries.length > 2) {
          const tempSeries = forecast.timeSeries[2];
          const tempArea = tempSeries.areas.find(
            (a) => a.area.code === TOKYO_AREA_CODE
          );

          if (tempArea && tempSeries.timeDefines) {
            for (let i = 0; i < tempSeries.timeDefines.length; i++) {
              const date = tempSeries.timeDefines[i].split("T")[0];

              if (targetDates.includes(date)) {
                const existingDay = weatherData.find((d) => d.date === date);
                if (existingDay) {
                  existingDay.temperature = {
                    min: tempArea.tempsMin?.[i] || "---",
                    max: tempArea.tempsMax?.[i] || "---",
                  };
                }
              }
            }
          }
        }
      }
    }

    if (weatherData.length === 0) {
      for (const date of targetDates) {
        weatherData.push({
          date: date,
          dateLabel: date === "2025-09-13" ? "9月13日（土）" : "9月14日（日）",
          weather: "予報データがまだありません",
          temperature: {
            min: "---",
            max: "---",
          },
        });
      }
    }

    weatherData.sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json(weatherData);
  } catch (error) {
    console.error("Weather API error:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
}
