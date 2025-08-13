"use client";

import { 
  Title, 
  Stack, 
  SimpleGrid, 
  Card, 
  Text, 
  Badge,
  Group,
  Image,
  useMantineTheme,
  Paper
} from "@mantine/core";
import { useEffect, useState } from "react";
import { getMenu } from "../_actions/getMenu";
import { MenuItem } from "@/types/types";
import { useContext } from "react";
import { LoadingContext } from "../_contexts/LoadingContext";

export default function Menu() {
  const theme = useMantineTheme();
  const { setLoading } = useContext(LoadingContext);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMenu();
        setMenuItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [setLoading]);

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        メニュー
      </Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {menuItems.map((menuItem) => (
          <Card 
            key={menuItem.id} 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
          >
            {menuItem.image && (
              <Card.Section>
                <Image
                  src={menuItem.image}
                  height={160}
                  alt={menuItem.name}
                  fallbackSrc="/images/placeholder.png"
                />
              </Card.Section>
            )}
            
            <Stack gap="sm" mt={menuItem.image ? "md" : 0}>
              <Group justify="space-between" align="flex-start">
                <Text size="lg" fw={600}>
                  {menuItem.name}
                </Text>
                {menuItem.isActive && (
                  <Badge color="green" variant="light" size="sm">
                    販売中
                  </Badge>
                )}
              </Group>
              
              <Badge 
                size="xl" 
                variant="filled" 
                color={theme.primaryColor}
                radius="md"
                fullWidth
              >
                {menuItem.price}円
              </Badge>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
      
      {menuItems.length === 0 && (
        <Paper p="xl" withBorder>
          <Text ta="center" c="dimmed">
            メニューアイテムがありません
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
