import React, { useEffect, useState } from 'react'
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Link } from "react-router-dom";
import { Note } from '../firebase/interfaces/interface.notes';
import { getAdditionalUserData } from '../firebase/func/user';
import { AdditionalUserInfo } from '../firebase/interfaces/interface.userInfo';



interface Props {
    note: Note;
}

const NoteCard: React.FC<Props> = ({ note }) => {


      const [userInfo, setUserInfo] = useState<AdditionalUserInfo | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      console.log(typeof note.date);
      
      useEffect(() => {
        const fetchUser = async () => {
          try {
              const _userInfo = await getAdditionalUserData(note.user_id);
              console.log(_userInfo)
              setUserInfo(_userInfo);
            
          } catch (err) {
            console.log(err)
            setError(err instanceof Error ? err.message : 'Failed to fetch user');
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchUser();
      }, [note]);
  
  return (
    <Card
      sx={{
        height: "100%",
        ":hover": {
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/notes/${note.id}`} // Entire card is clickable
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          height: "100%",
        }}

      >
        <CardContent>
          {/* Show each couse, example: "Statistikk (ISTT1003) with description" */}
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            {note.title}
          </Typography>
          <Divider sx={{ my: 1 }} />
       
          {(isLoading ? (<p>loading</p>) 
          : ( error ? (<p>Error loading user</p>) 
          : (
            <Typography variant="subtitle1" color="text.secondary">
            Laget av: {userInfo?.firstName} {userInfo?.lastName}
          </Typography>
          )))}
          
          <Typography variant="subtitle1" color="text.secondary">
            Laget: {note.date.toDateString()}
          </Typography>
       
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default NoteCard