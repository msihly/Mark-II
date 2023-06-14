import { ReactNode, useState } from "react";
import { observer } from "mobx-react-lite";
import { Bookmark, useStores } from "store";
import { deleteBookmarks } from "database";
import { Menu } from "@mui/material";
import { ListItem, View, ViewProps } from "components";
import { InfoModal } from ".";
import { copyToClipboard } from "utils";

interface ContextMenuProps extends ViewProps {
  children?: ReactNode | ReactNode[];
  bookmark: Bookmark;
}

export const ContextMenu = observer(({ children, bookmark, ...props }: ContextMenuProps) => {
  const { bookmarkStore } = useStores();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);

  const copyLink = () => {
    copyToClipboard(bookmark.pageUrl, `Copied: ${bookmark.pageUrl}`);
    handleClose();
  };

  const handleContext = (event) => {
    event.preventDefault();
    setMouseX(event.clientX - 2);
    setMouseY(event.clientY - 4);
  };

  const handleClose = () => {
    setMouseX(null);
    setMouseY(null);
  };

  const handleDelete = () => {
    deleteBookmarks(bookmarkStore, bookmark.isSelected ? bookmarkStore.selected : [bookmark]);
    handleClose();
  };

  const openInfo = () => {
    setIsInfoOpen(true);
    handleClose();
  };

  const listItemProps = {
    iconMargin: "0.5rem",
    paddingLeft: "0.2em",
    paddingRight: "0.5em",
  };

  return (
    <View {...props} id={bookmark.id} onContextMenu={handleContext}>
      {children}

      <Menu
        open={mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          mouseX !== null && mouseY !== null ? { top: mouseY, left: mouseX } : undefined
        }
      >
        <ListItem text="Copy" icon="ContentCopy" onClick={copyLink} {...listItemProps} />

        <ListItem text="Info" icon="Info" onClick={openInfo} {...listItemProps} />

        <ListItem
          text={bookmark?.isArchived ? "Delete" : "Archive"}
          icon={bookmark?.isArchived ? "Delete" : "Archive"}
          onClick={handleDelete}
          {...listItemProps}
        />
      </Menu>

      {isInfoOpen && <InfoModal bookmarkId={bookmark.id} setVisible={setIsInfoOpen} />}
    </View>
  );
});
