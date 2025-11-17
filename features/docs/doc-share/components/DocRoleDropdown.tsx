import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Role, useTrans } from '@/features/docs/doc-management';

type Props = {
  currentRole: Role;
  onSelectRole?: (role: Role) => void;
  canUpdate?: boolean;
  isLastOwner?: boolean;
  isOtherOwner?: boolean;
};

export const DocRoleDropdown = ({
  canUpdate = true,
  currentRole,
  onSelectRole,
  isLastOwner,
  isOtherOwner,
}: Props) => {
  const { transRole, translatedRoles, getNotAllowedMessage } = useTrans();

  if (!canUpdate) {
    return (
      <span className="font-semibold" aria-label="doc-role-text">
        {transRole(currentRole)}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="font-semibold font-sans">
        {transRole(currentRole)}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.keys(translatedRoles).map((key) => (
          <DropdownMenuItem
            key={key}
            disabled={isLastOwner || isOtherOwner}
            className={currentRole === key ? "bg-accent" : ""}
            onClick={() => onSelectRole?.(key as Role)}
          >
            {transRole(key as Role)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
