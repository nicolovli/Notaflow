import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Paper,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { getAllUsers } from "../firebase/func/user";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";

interface AddMembersProp {
  selectedUsers: BasicUserInfo[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<BasicUserInfo[]>>;
  group_creator: string;
}

const AddMembers = ({ selectedUsers, setSelectedUsers, group_creator }: AddMembersProp) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<BasicUserInfo[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let u = await getAllUsers();
        u = u.filter((u) => u.id !== group_creator);
        setUsers(u);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddUser = (user: BasicUserInfo) => {
    if (!selectedUsers.some((selectedUser) => selectedUser.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (id: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== id));
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const userName = user.username.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) || userName.includes(searchQuery.toLowerCase())
    );
  });

  if (error) {
    return (
      <Alert variant="filled" severity="error" sx={{ marginTop: 2 }}>
        An error occurred. Check your network connection
      </Alert>
    );
  }

  if (isLoading) {
    return <CircularProgress sx={{ marginTop: 2 }} size={24} />;
  }

  return (
    <Box>
      <label
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: "500",
          fontFamily: "sans-serif",
        }}>
        Søk etter brukere
      </label>
      {/* Search Input */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Søk etter brukere..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
        }}
        sx={{ mb: 2 }}
      />

      {/* Selected Users List */}
      {selectedUsers.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Valgte medlemmer ({selectedUsers.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedUsers.map((user) => (
              <Chip
                key={user.id}
                avatar={
                  <Avatar alt={`${user.firstName} ${user.lastName}`}>
                    {user.firstName?.[0] || "?"}
                  </Avatar>
                }
                label={`${user.firstName} ${user.lastName}`}
                onDelete={() => handleRemoveUser(user.id)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* User Search Results */}
      <Paper sx={{ maxHeight: 300, overflow: "auto" }}>
        <List>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  selectedUsers.some((u) => u.id === user.id) ? (
                    <IconButton
                      sx={{ marginRight: 1 }}
                      edge="end"
                      onClick={() => handleRemoveUser(user.id)}
                      color="error">
                      <PersonRemoveIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      sx={{ marginRight: 1 }}
                      edge="end"
                      onClick={() => handleAddUser(user)}
                      color="primary">
                      <PersonAddIcon />
                    </IconButton>
                  )
                }
                sx={{
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  bgcolor: selectedUsers.some((u) => u.id === user.id)
                    ? "rgba(25, 118, 210, 0.08)"
                    : "transparent",
                }}>
                <ListItemAvatar>
                  <Avatar alt={`${user.firstName} ${user.lastName}`}>
                    {user.firstName?.[0] || "?"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.firstName || ""} ${user.lastName || ""}`}
                  secondary={`@${user.username}${user.isAdmin ? " • Admin" : ""}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Ingen brukere funnet" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default AddMembers;
