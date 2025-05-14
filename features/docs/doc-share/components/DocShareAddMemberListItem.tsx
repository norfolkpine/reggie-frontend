import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { User } from '@/types/api';

type Props = {
  user: User;
  onRemoveUser?: (user: User) => void;
};

export const DocShareAddMemberListItem = ({ user, onRemoveUser }: Props) => {
  return (
    <div
      data-testid={`doc-share-add-member-${user.email}`}
      className="flex flex-row items-center justify-center gap-1 bg-gray-100 rounded px-2 py-0.5 text-sm text-gray-900"
    >
      <span className="text-sm">
        {user.first_name || user.email}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onRemoveUser?.(user)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
