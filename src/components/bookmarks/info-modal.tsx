import { Dialog, DialogTitle, DialogContent, DialogActions, colors } from "@mui/material";
import { refreshBookmark } from "database";
import { observer } from "mobx-react-lite";
import { useStores } from "store";
import { Button, DetailRows, SideScroller, Tag, Text } from "components";
import { dayjs, makeClasses } from "utils";
import { toast } from "react-toastify";

interface InfoModalProps {
  bookmarkId: string;
  setVisible: (visible: boolean) => void;
}

export const InfoModal = observer(({ bookmarkId, setVisible }: InfoModalProps) => {
  const { css } = useClasses(null);

  const { bookmarkStore } = useStores();
  const bookmark = bookmarkStore.getById(bookmarkId);

  const handleClose = () => setVisible(false);

  const handleRefresh = async () => {
    const res = await refreshBookmark(bookmarkStore, bookmarkId);
    if (res === null) toast.error("Failed to refresh info");
    else toast.success("Bookmark info refreshed");
  };

  return (
    <Dialog open={true} onClose={handleClose} scroll="paper">
      <DialogTitle className={css.title}>Info</DialogTitle>

      <DialogContent dividers>
        <DetailRows
          labelWidth="6em"
          rows={[
            { label: "ID", value: bookmarkId || "N/A" },
            { label: "Title", value: bookmark?.title || "N/A" },
            { label: "Original Title", value: bookmark?.originalTitle || "N/A" },
            { label: "URL", value: bookmark?.pageUrl || "N/A" },
            { label: "Image Hash", value: bookmark?.imageHash || "N/A" },
            { label: "Image Path", value: bookmark?.imagePath || "N/A" },
            {
              label: "Date Created",
              value: dayjs(bookmark?.dateCreated).format("MMMM D, YYYY - hh:mm:ss a") || "N/A",
            },
            {
              label: "Date Modified",
              value: dayjs(bookmark?.dateModified).format("MMMM D, YYYY - hh:mm:ss a") || "N/A",
            },
            {
              label: "Tags",
              value:
                bookmark?.tags?.length > 0 ? (
                  <SideScroller innerClassName={css.tags}>
                    {bookmark.tags.map((t) => (
                      <Tag key={t.id} tag={t} size="small" />
                    ))}
                  </SideScroller>
                ) : (
                  <Text>{"N/A"}</Text>
                ),
            },
          ]}
        />
      </DialogContent>

      <DialogActions className={css.buttons}>
        <Button text="Close" icon="Close" onClick={handleClose} className={css.closeButton} />

        <Button text="Refresh" icon="Refresh" onClick={handleRefresh} />
      </DialogActions>
    </Dialog>
  );
});

const useClasses = makeClasses({
  buttons: {
    justifyContent: "center",
  },
  closeButton: {
    backgroundColor: colors.red["800"],
    "&:hover": {
      backgroundColor: colors.red["700"],
    },
  },
  tags: {
    borderBottomLeftRadius: "inherit",
    borderBottomRightRadius: "inherit",
    padding: "0.2em 0.3em",
    height: "1.8rem",
  },
  title: {
    padding: "0.4em",
    textAlign: "center",
  },
});
