"use client";

import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { Button } from "@/components/Button";
import "./index.css";

export type TopbarProps = {
  title?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  onSaveClick?: () => void;
  isSaving?: boolean;
  isDisabled?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
};

export default function Topbar({
  title = "Novo Questionário",
  showBack = false,
  onBackClick,
  onSaveClick,
  isSaving = false,
  isDisabled = false,
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
          <Typography variant="h6" className="topbar__title">
            {title}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={3}
          className="topbar__actions"
        >
          {rightSlot}

          {onSaveClick && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer">
              <Button
                onClick={onSaveClick}
                disabled={isDisabled || isSaving}
              >
                {isSaving ? (
                  <div className="w-5 h-5 text-orange-500 animate-spin">
                    <svg fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <Save className={`w-5 h-5 ${isDisabled ? 'text-gray-400' : 'text-white'}`} />
                )}
              </Button>
            </div>
          )}

          {showBack && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer">
              <Button
                onClick={onBackClick}
              >
                <ArrowBack className="w-5 h-5 text-white" />
              </Button>
            </div>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}


