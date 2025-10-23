"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Grid, IconButton } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import './index.css';

export function SearchBoxComponent() {
    const [search, setSearch] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSubmit = () => {
        console.log("Valor da busca:", search);
        // Aqui você poderia chamar uma API, filtrar uma lista, etc
    };

    return (
        <Grid className="custom-searchbox" container spacing={2}>
            <div aria-label="input">
                <Input onChange={handleChange} placeholder="Procure por um questionário" />
            </div>
            <div aria-label="button">
                <IconButton onClick={handleSubmit} disabled={false}>
                    <SearchIcon />
                </IconButton>
            </div>
        </Grid>
    );
}


