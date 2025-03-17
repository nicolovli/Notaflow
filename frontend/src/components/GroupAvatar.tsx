import React, { useEffect, useState } from "react";
import { Alert, AvatarGroup, Avatar } from "@mui/material";
import { Group } from "../firebase/interfaces/interface.groups";
import { BasicUserInfo } from "../firebase/interfaces/interface.userInfo";
import { getAdditionalUserData } from "../firebase/func/user";
import { stringAvatar } from "../util/avatar";


const GroupAvatar: React.FC<{group: Group, size?: number}> = ({ group, size = 36 }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<BasicUserInfo[]>([]);

    useEffect(() => {
        const getGroups = async() => {
            try {
                const memberInfo = group.members.map(async (m) => {
                    const userInfo = await getAdditionalUserData(m);
                    return userInfo;
                })
                Promise.all(memberInfo)
                .then(r => {
                    setUsers(r);
                    setIsLoading(false);
                })

            } catch (err) {
                console.error("An error occured while trying to fetch groups: ", err);
                setError(err instanceof Error ? err.message : "Failed to fetch subjects");
            }
        }
        getGroups();
    }, [])

    if (isLoading)
        return

    if (error) {
        return (
          <Alert variant="filled" severity="error">
            An error occurred. Check your network connection
          </Alert>
        );
    }

    return (
        <AvatarGroup 
            max={3}
            sx={{
            "& .MuiAvatar-root": {
                width: size,
                height: size,
                fontSize: "0.9rem",
                border: "2px solid white"
            }
            }}
        >
            {users.map(m => {
            const fullName = m.firstName.trim() + " " +m.lastName.trim();
            return <Avatar 
                        key={m.username} 
                        {...stringAvatar(fullName)}
                    />;
            })}
        </AvatarGroup>
    );
};

export default GroupAvatar;
