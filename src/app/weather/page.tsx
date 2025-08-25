"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  Text,
  Group,
  Stack,
  Loader,
  Alert,
  Badge,
  Grid,
  Card,
} from "@mantine/core";
import {
  IconCloud,
  IconSun,
  IconCloudRain,
  IconSnowflake,
  IconCloudStorm,
  IconTemperature,
  IconWind,
  IconDroplet,
} from "@tabler/icons-react";

interface WeatherData {
  date: string;
  dateLabel: string;
  weather: string;
  temperature?: {
    min: string;
    max: string;
  };
  precipitationProbability?: string[];
  wind?: string;
}

const getWeatherIcon = (weather: string) => {
  if (weather.includes("晴")) return <IconSun size={24} />;
  if (weather.includes("雨")) return <IconCloudRain size={24} />;
  if (weather.includes("雪")) return <IconSnowflake size={24} />;
  if (weather.includes("雷")) return <IconCloudStorm size={24} />;
  return <IconCloud size={24} />;
};

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch("/api/weather");
        if (!response.ok) throw new Error("天気データの取得に失敗しました");

        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "天気データの取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>天気データを取得中...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="エラー">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl" ta="center">
        イベント期間の天気予報
      </Title>

      <Grid>
        {weatherData.map((day) => (
          <Grid.Col key={day.date} span={{ base: 12, sm: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={500} size="lg">
                    {day.dateLabel}
                  </Text>
                </Group>
              </Card.Section>

              <Stack mt="md" gap="md">
                <Group gap="xs">
                  {getWeatherIcon(day.weather)}
                  <Text size="xl" fw={500}>
                    {day.weather}
                  </Text>
                </Group>

                {day.temperature && (
                  <Group gap="xs">
                    <IconTemperature size={20} />
                    <Text>
                      最低: {day.temperature.min}°C / 最高:{" "}
                      {day.temperature.max}°C
                    </Text>
                  </Group>
                )}

                {day.precipitationProbability &&
                  day.precipitationProbability.length > 0 && (
                    <div>
                      <Group gap="xs" mb="xs">
                        <IconDroplet size={20} />
                        <Text fw={500}>降水確率</Text>
                      </Group>
                      <Group gap="xs">
                        {day.precipitationProbability.map((prob, index) => (
                          <Badge key={index} variant="light" color="blue">
                            {["0-6時", "6-12時", "12-18時", "18-24時"][index]}:{" "}
                            {prob}
                          </Badge>
                        ))}
                      </Group>
                    </div>
                  )}

                {day.wind && (
                  <Group gap="xs">
                    <IconWind size={20} />
                    <Text>風: {day.wind}</Text>
                  </Group>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Paper p="md" mt="xl" withBorder>
        <Text size="sm" c="dimmed" ta="center">
          ※ 天気予報は気象庁のデータを使用しています
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          ※ 予報は変更される可能性があります
        </Text>
      </Paper>
    </Container>
  );
}
