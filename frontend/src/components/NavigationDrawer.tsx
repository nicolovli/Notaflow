import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MenuIcon from "@mui/icons-material/Menu";
import MuiDrawer from "@mui/material/Drawer";
import TagIcon from "@mui/icons-material/Tag";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";
import { getAdditionalUserData } from "../firebase/func/user";
import { auth } from "../Config/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

const drawerWidth = 240; // Drawer width when expanded

// Opened drawer styling
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

// Closed drawer styling
const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: theme.spacing(10),
});

// Drawer heading styling
const DrawerHeader = styled("div")<{ open: boolean }>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 2.3),
  ...theme.mixins.toolbar,
}));

// Drawer component styling
const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

// List of navigation items(pages). (Add new ones here)
const BASE_NAVIGATION = [
  { segment: "Dashboard", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "myNotes", title: "Mine notater", icon: <StickyNote2Icon /> },
  { segment: "myFavoriteNotes", title: "Favoritter", icon: <FavoriteIcon /> },
  { segment: "privateGroupPage", title: "Mine grupper", icon: <GroupsIcon /> },
];

const ADMIN_NAVIGATION = [
  { segment: "createCourse", title: "Opprett Fag", icon: <CreateNewFolderIcon /> },
  { segment: "createCategory", title: "Opprett Kategori", icon: <TagIcon/>}
];

const NavigationDrawer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [currentUserFirebase, setCurrentUserFirebase] = useState<BasicUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getAdditionalUserData(user.uid);
        setCurrentUserFirebase(userData);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigation = (segment?: string) => {
    if (!segment) return;
    navigate(`/${segment}`);
  };

  const navigationItems = React.useMemo(() => {
    if (isLoading) return BASE_NAVIGATION;
    return currentUserFirebase?.isAdmin
      ? [...BASE_NAVIGATION, ...ADMIN_NAVIGATION]
      : BASE_NAVIGATION;
  }, [currentUserFirebase, isLoading]);

  return (
    <StyledDrawer variant="permanent" open={open} PaperProps={{ style: { position: "relative" } }}>
      <DrawerHeader open={open}>
        {open ? (
          <Typography
            variant="h6"
            sx={{
              color: "grey",
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-start",
              paddingLeft: 1.5,
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}>
            Oversikt
          </Typography>
        ) : null}
        <IconButton onClick={() => setOpen(!open)}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {navigationItems.map((item) => {
          const isActive = location.pathname.includes(item.segment);
          return (
            <ListItem key={item.segment} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.segment)}
                sx={{
                  backgroundColor: isActive ? "rgba(63, 81, 181, 0.2)" : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(63, 81, 181, 0.1)",
                  },
                  height: 48,
                }}>
                <ListItemIcon
                  sx={{
                    minWidth: 48,
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    paddingLeft: 1.5,
                  }}>
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.title}
                    sx={{
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </StyledDrawer>
  );
};

export default NavigationDrawer;
