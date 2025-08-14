"use client";

import React, { useCallback, useState } from "react";
import {
  AppShell,
  Title,
  Burger,
  Container,
  LoadingOverlay,
  Group,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Navbar from "./Navbar";
import { useRouter } from "next/navigation";
import { LoadingContext } from "../_contexts/LoadingContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const router = useRouter();
  const theme = useMantineTheme();

  const [loadingCount, setLoadingCount] = useState(0);
  const loading = loadingCount > 0;
  const startLoading = useCallback(
    () => setLoadingCount((prev) => prev + 1),
    []
  );
  const stopLoading = useCallback(
    () => setLoadingCount((prev) => prev - 1),
    []
  );


  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      <LoadingOverlay
        visible={loading}
        zIndex={9999}
        overlayProps={{ radius: "sm", blur: 2 }}
        pos="fixed"
        inset={0}
      />
      <AppShell
        padding="md"
        header={{ height: 60 }}
        navbar={{
          width: 200,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Title
              order={1}
              size="h2"
              onClick={() => router.push("/")}
              style={{
                cursor: "pointer",
                color: theme.colors[theme.primaryColor][6],
                fontWeight: 700,
              }}
            >
              氷川かき氷
            </Title>
          </Group>
        </AppShell.Header>

        <Navbar onNavigate={close} />

        <AppShell.Main>
          <Container size="lg" py="xl">
            {children}
          </Container>
        </AppShell.Main>
      </AppShell>
    </LoadingContext.Provider>
  );
}
