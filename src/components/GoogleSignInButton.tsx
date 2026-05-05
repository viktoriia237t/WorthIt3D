import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { LogIn, LogOut } from "lucide-react";
import type { AuthUser } from '../api/auth';

interface GoogleSignInButtonProps {
  user: AuthUser | null;
  loading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  user,
  loading,
  onSignIn,
  onSignOut,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        isLoading
        aria-label="Loading"
      />
    );
  }

  if (user) {
    return (
      <Dropdown>
        <DropdownTrigger>
          <Button
            size="sm"
            variant="flat"
            startContent={
              user.picture ? (
                <Avatar src={user.picture} size="sm" className="w-5 h-5" />
              ) : undefined
            }
          >
            {user.name?.split(' ')[0] || user.email?.split('@')[0]}
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="User menu">
          <DropdownItem
            key="signout"
            startContent={<LogOut size={16} />}
            onPress={onSignOut}
          >
            {t('auth.signOut')}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  return (
    <Tooltip content={t('auth.signIn')}>
      <Button
        size="sm"
        variant="flat"
        startContent={<LogIn size={16} />}
        onPress={onSignIn}
        aria-label={t('auth.signIn')}
      >
        {t('auth.signIn')}
      </Button>
    </Tooltip>
  );
};
