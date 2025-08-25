import { AppShell, NavLink, Stack, useMantineTheme } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  IconHome, 
  IconMenu2, 
  IconShoppingCart, 
  IconHistory,
  IconCloudRain
} from "@tabler/icons-react";

export default function Navbar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const theme = useMantineTheme();
  
  return (
    <AppShell.Navbar p="md">
      <Stack gap="xs">
        <NavLink
          active={pathname === "/"}
          component={Link}
          href="/"
          label="ホーム"
          leftSection={<IconHome size={20} />}
          onClick={onNavigate}
          variant="filled"
          styles={{
            root: {
              borderRadius: theme.radius.md,
              fontWeight: pathname === "/" ? 600 : 400,
            }
          }}
        />
        <NavLink
          active={pathname === "/menu"}
          component={Link}
          href="/menu"
          label="メニュー"
          leftSection={<IconMenu2 size={20} />}
          onClick={onNavigate}
          variant="filled"
          styles={{
            root: {
              borderRadius: theme.radius.md,
              fontWeight: pathname === "/menu" ? 600 : 400,
            }
          }}
        />
        <NavLink
          active={pathname === "/order"}
          component={Link}
          href="/order"
          label="注文"
          leftSection={<IconShoppingCart size={20} />}
          onClick={onNavigate}
          variant="filled"
          styles={{
            root: {
              borderRadius: theme.radius.md,
              fontWeight: pathname === "/order" ? 600 : 400,
            }
          }}
        />
        <NavLink
          active={pathname === "/order-history"}
          component={Link}
          href="/order-history"
          label="注文履歴"
          leftSection={<IconHistory size={20} />}
          onClick={onNavigate}
          variant="filled"
          styles={{
            root: {
              borderRadius: theme.radius.md,
              fontWeight: pathname === "/order-history" ? 600 : 400,
            }
          }}
        />
        <NavLink
          active={pathname === "/weather"}
          component={Link}
          href="/weather"
          label="天気予報"
          leftSection={<IconCloudRain size={20} />}
          onClick={onNavigate}
          variant="filled"
          styles={{
            root: {
              borderRadius: theme.radius.md,
              fontWeight: pathname === "/weather" ? 600 : 400,
            }
          }}
        />
      </Stack>
    </AppShell.Navbar>
  );
}
