import { cn } from "@/lib/utils"

export const quickSearchStyles = {
  root: "w-full bg-white rounded-lg overflow-hidden transition-transform duration-100 outline-none",
  input: "border-none w-full text-[17px] p-2 bg-white outline-none text-foreground rounded-none placeholder:text-muted-foreground",
  item: cn(
    "content-visibility-auto cursor-pointer rounded-sm text-sm flex items-center gap-2 select-none transition-all duration-150",
    "hover:bg-muted data-[selected=true]:bg-muted",
    "data-[disabled=true]:text-muted-foreground data-[disabled=true]:cursor-not-allowed",
    "[&+&]:mt-1"
  ),
  list: "p-4 flex-1 overflow-y-auto overscroll-contain",
  shortcuts: "flex ml-auto gap-2",
  shortcutKey: "text-xs min-w-5 px-1 h-5 rounded-sm text-white bg-muted-foreground inline-flex items-center justify-center uppercase",
  separator: "h-px w-full bg-muted-foreground my-1",
  group: "mt-2",
  groupHeading: cn(
    "select-none text-sm text-muted-foreground font-bold",
    "flex items-center mb-1"
  ),
  showRightOnFocus: "opacity-0 group-hover:opacity-100 group-data-[selected=true]:opacity-100",
  modalScroller: cn(
    "p-0",
    "[&_.c__modal__close_.c__button]:right-1 [&_.c__modal__close_.c__button]:top-1 [&_.c__modal__close_.c__button]:p-6 [&_.c__modal__close_.c__button]:px-4",
    "[&_.c__modal__title]:text-xs [&_.c__modal__title]:p-4 [&_.c__modal__title]:mb-0"
  )
}

export const QuickSearchStyle = () => {
  return (
    <div className={quickSearchStyles.root}>
      <div className={quickSearchStyles.input} />
    </div>
  )
}
