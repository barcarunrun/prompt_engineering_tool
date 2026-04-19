'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import DataObjectIcon from '@mui/icons-material/DataObject';
import StorageIcon from '@mui/icons-material/Storage';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const NAV_ITEMS = [
  {
    label: 'プロンプト一覧',
    href: '/prompts',
    icon: <ListAltIcon />,
    exact: true,
    adminOnly: false,
  },
  {
    label: 'プロンプト一括検証',
    href: '/prompts/batch-verify',
    icon: <PlaylistPlayIcon />,
    exact: false,
    adminOnly: false,
  },
  {
    label: '適用テキストJSON作成',
    href: '/prompts/build-json',
    icon: <DataObjectIcon />,
    exact: false,
    adminOnly: false,
  },
  {
    label: '保存済みテキスト一覧',
    href: '/prompts/target-texts',
    icon: <StorageIcon />,
    exact: false,
    adminOnly: false,
  },
  {
    label: 'ユーザ管理',
    href: '/users',
    icon: <PeopleIcon />,
    exact: false,
    adminOnly: true,
  },
  {
    label: 'チーム管理',
    href: '/teams',
    icon: <GroupsIcon />,
    exact: false,
    adminOnly: true,
  },
];

export default function Sidebar({ open, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || userRole === 'admin');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
        }}
      >
        <AutoAwesomeIcon color="primary" />
        <Typography variant="h6" noWrap sx={{ fontSize: '1rem', fontWeight: 700 }}>
          PromptTool
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ px: 1, py: 1 }}>
        <List disablePadding>
          {visibleNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  onClick={isMobile ? onClose : undefined}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? 'white' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: { fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ px: 1, py: 1 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'error.50',
                  color: 'error.main',
                  '& .MuiListItemIcon-root': {
                    color: 'error.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="ログアウト"
                slotProps={{
                  primary: { sx: { fontSize: '0.875rem', fontWeight: 400 } },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
