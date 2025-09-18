"use client";

import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import { ArrowBack, Search } from "@mui/icons-material";
import "./index.css";

export type TopbarProps = {
  title?: string;
  /** Mostra o botão de voltar */
  showBack?: boolean;
  /** Callback do botão de voltar */
  onBackClick?: () => void;
  /** Callback do botão de busca (lupa) */
  onSearchClick?: () => void;
  /** Ações extras à direita (ex: <Button/>, <Avatar/>, etc.) */
  rightSlot?: React.ReactNode;
  /** Classes extras */
  className?: string;
};

export default function Topbar({
  title = "Novo Questionário",
  showBack = false,
  onBackClick,
  onSearchClick,
  rightSlot,
  className,
}: TopbarProps) {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      className={`topbar ${className ?? ""}`}
    >
      <Toolbar className="topbar__toolbar">
        <Stack direction="row" alignItems="center" spacing={1}>
          {showBack && (
            <IconButton
              aria-label="Voltar"
              onClick={onBackClick}
              className="topbar__btn"
              size="small"
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          )}

          <Typography variant="h6" className="topbar__title">
            {title}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          className="topbar__actions"
        >
          {onSearchClick && (
            <IconButton
              aria-label="Buscar"
              onClick={onSearchClick}
              className="topbar__btn"
              size="small"
            >
              <Search fontSize="small" />
            </IconButton>
          )}

          {rightSlot}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
