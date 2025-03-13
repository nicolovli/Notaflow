import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../Config/firebase-config";
import { getAdditionalUserData } from "../firebase/func/user";
import { createCategory, getCategory } from "../firebase/func/category";
import { Alert, CircularProgress, TextField } from "@mui/material";
import type { CreateCategory } from "../firebase/interfaces/interface.category";

const CreateCategory = () => {
    const { id: categoryId } = useParams();
    const navigate = useNavigate();

    const [tag, setTag] = useState("");
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!!categoryId);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadedAdminStatus, setLoadedAdminStatus] = useState(false);

    //Error handling 
    const [tagError, setTagError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async() => {
            try {
                if(auth.currentUser) {
                    const userData = await getAdditionalUserData(auth.currentUser.uid);
                    setLoadedAdminStatus(true);
                    setIsAdmin(userData?.isAdmin || false);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setIsAdmin(false);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (categoryId){
            setIsFetching(true);
            getCategory(categoryId)
                .then((category) => {
                    setTag(category.tag);
                })
                .catch((error) => console.error("Error fetching category:", error))
                .finally(() => setIsFetching(false));
        }

    }, [categoryId]);

    if(isAdmin === false && loadedAdminStatus) {
        return <Alert severity="error">Du har ikke tilgang til å redigere eller opprette kategorier.</Alert>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    }

    const onSubmit = async () => { 
        setTagError(null);
        let hasError = false;
        if (!tag.trim()){
            setTagError("Kategorinavn kan ikke være tomt");
            hasError = true;
        }
        if (hasError) return;
        setLoading(true);
        try {
            const categoryData: CreateCategory = {
                tag, 
            };
            if(categoryData){
                await createCategory(categoryData);
                navigate("/", {state: {message: "Kategorien er oppdatert!"}});
            } else {
                await createCategory(categoryData);
                navigate("/", {state: {message: "Kategorien er opprettet!"}});
            }
        } catch (error) {
            console.error("Error creating category:", error);
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) {
        return(
            <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#f3f4f6",
            }}>
                <CircularProgress/>
            </div>
        );
    }

    return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f3f4f6",
          }}>
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "15px",
                fontFamily: "sans-serif",
              }}>
              {categoryId ? "Rediger kategori" : "Opprett en ny kategori!"}
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    fontFamily: "sans-serif",
                  }}>
                  Tag
                </label>
                <TextField
                  type="text"
                  value={tag}
                  error={!!tagError}
                  helperText={tagError}
                  onChange={(e) => setTag(e.target.value)}
                  fullWidth
                  placeholder="Skriv inn en tag..."
                />
              </div>
    
              <button
                type="submit"
                onClick={onSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}>
                {loading ? "Lagrer..." : categoryId ? "Oppdater kategori" : "Opprett kategori"}
              </button>
            </form>
          </div>
        </div>
      );
}

export default CreateCategory;