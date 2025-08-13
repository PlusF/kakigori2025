"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import { Socket, io } from "socket.io-client";
import { SocketContext } from "../_contexts/SocketContext";
import { Prisma } from "@prisma/client";
import { LoadingContext } from "../_contexts/LoadingContext";
import { Summary } from "@/types/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const router = useRouter();
  const theme = useMantineTheme();

  const [orders, setOrders] = useState<
    Prisma.OrderGetPayload<{
      include: {
        OrderItem: {
          include: {
            MenuItem: true;
          };
        };
      };
    }>[]
  >([]);
  const [summary, setSummary] = useState<Summary>({
    totalSales: 0,
    totalOrders: 0,
    totalQuantity: 0,
    popularItems: [],
  });
  const [socket, setSocket] = useState<Socket | null>(null);

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

  useEffect(() => {
    (async () => {
      startLoading();
      await fetch("http://localhost:3000/api/sockets", { method: "POST" });
      const s = io();
      s.connect();
      s.on("order", (data) => {
        setOrders((prev) => [...prev, ...data.orders]);
        setSummary(data.summary);
      });
      setSocket(s);
      stopLoading();
    })();
  }, [startLoading, stopLoading]);

  return (
    <SocketContext.Provider value={{ socket, orders, summary }}>
      <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
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
    </SocketContext.Provider>
  );
}
