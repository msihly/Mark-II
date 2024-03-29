import { Dispatch, SetStateAction, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "store";
import { Dialog, DialogTitle, DialogContent, DialogActions, colors } from "@mui/material";
import { Button, Icon, Input, Text, View } from "components";
import { makeClasses } from "utils";
import { deleteTag } from "database";
import { toast } from "react-toastify";

interface ConfirmDeleteModalProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export const ConfirmDeleteModal = observer(({ setVisible }: ConfirmDeleteModalProps) => {
  const { bookmarkStore, tagStore } = useStores();
  const { css } = useClasses(null);

  const [confirmValue, setConfirmValue] = useState("");

  const handleClose = () => setVisible(false);

  const handleDelete = async () => {
    try {
      await deleteTag({ bookmarkStore, id: tagStore.activeTagId, tagStore });
      toast.success("Tag deleted");
      handleClose();
    } catch (err) {
      toast.error("Failed to delete tag");
      console.error(err);
    }
  };

  return (
    <Dialog open onClose={handleClose} scroll="paper">
      <DialogTitle className={css.dialogTitle}>Confirm Delete</DialogTitle>

      <DialogContent className={css.dialogContent}>
        <View column className={css.body}>
          <Icon name="Delete" color={colors.red["900"]} size="5rem" />

          <Text className={css.subText}>
            <Text color={colors.red["800"]} bold>
              {bookmarkStore.listByTagId(tagStore.activeTagId)?.length}
            </Text>
            {" bookmarks will be affected."}
          </Text>

          <Text className={css.subText}>
            <Text color={colors.red["800"]} bold>
              {tagStore.listByParentId(tagStore.activeTagId)?.length}
            </Text>
            {" child tags will be affected."}
          </Text>

          <Input
            placeholder={`Enter "${tagStore.activeTag?.label}"`}
            value={confirmValue}
            setValue={setConfirmValue}
            color={colors.red["800"]}
            textAlign="center"
          />
        </View>
      </DialogContent>

      <DialogActions className={css.dialogActions}>
        <Button text="Cancel" icon="Close" onClick={handleClose} color={colors.grey["700"]} />

        <Button
          text="Delete"
          icon="Delete"
          onClick={handleDelete}
          disabled={confirmValue !== tagStore.activeTag?.label}
          color={colors.red["800"]}
        />
      </DialogActions>
    </Dialog>
  );
});

const useClasses = makeClasses({
  body: {
    flexDirection: "column",
    alignItems: "center",
  },
  dialogActions: {
    justifyContent: "center",
  },
  dialogContent: {
    padding: "0.5rem 1rem",
  },
  dialogTitle: {
    margin: 0,
    padding: "0.5rem 0",
    color: colors.grey["400"],
    fontSize: "1.5em",
    textAlign: "center",
  },
  subText: {
    margin: "0.5rem 0",
    color: colors.grey["400"],
    textAlign: "center",
  },
});
