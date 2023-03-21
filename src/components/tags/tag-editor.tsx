import { useMemo, useState } from "react";
import { createTag, editTag } from "database";
import { observer } from "mobx-react-lite";
import { TagOption, useStores } from "store";
import { DialogContent, DialogActions, colors } from "@mui/material";
import { Button, ChipInput, ChipOption, Input, TagInput, Text, View } from "components";
import { ConfirmDeleteModal } from ".";
import { makeClasses } from "utils";
import { toast } from "react-toastify";

interface TagEditorProps {
  isCreate: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const TagEditor = observer(({ isCreate, onCancel, onSave }: TagEditorProps) => {
  const { tagStore } = useStores();
  const { css } = useClasses(null);

  const [aliases, setAliases] = useState<ChipOption[]>(
    isCreate ? [] : tagStore.activeTag?.aliases?.map((a) => ({ label: a, value: a })) ?? []
  );
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [label, setLabel] = useState<string>(isCreate ? "" : tagStore.activeTag?.label ?? "");
  const [parentTags, setParentTags] = useState<TagOption[]>(
    isCreate ? [] : tagStore.activeTag?.parentTagOptions ?? []
  );

  const isDuplicateTag =
    (isCreate || label !== tagStore.activeTag?.label) && !!tagStore.getByLabel(label);

  const parentTagOptions = useMemo(() => {
    const filteredIds = [tagStore.activeTagId, ...tagStore.getChildTagIds(tagStore.activeTagId)];
    return tagStore.tagOptions.filter((opt) => !filteredIds.includes(opt.id));
  }, [tagStore.activeTagId, tagStore.tagOptions]);

  const handleDelete = () => setIsConfirmDeleteOpen(true);

  const saveTag = async () => {
    if (isDuplicateTag) return toast.error("Tag label must be unique");
    if (!label.trim().length) return toast.error("Tag label cannot be blank");

    const parentIds = parentTags.map((t) => t.id);
    const aliasStrings = aliases.map((a) => a.value);
    const tagParams = { aliases: aliasStrings, label, parentIds, tagStore };
    isCreate ? createTag(tagParams) : editTag({ ...tagParams, id: tagStore.activeTagId });

    onSave();
  };

  return (
    <>
      <DialogContent dividers className={css.dialogContent}>
        <View column>
          <Text className={css.sectionTitle}>Label</Text>
          <Input
            value={label}
            setValue={setLabel}
            textAlign="center"
            error={isDuplicateTag}
            helperText={isDuplicateTag ? "Tag already exists" : undefined}
          />

          <Text className={css.sectionTitle}>Aliases</Text>
          <ChipInput value={aliases} setValue={setAliases} />

          <Text className={css.sectionTitle}>Parent Tags</Text>
          <TagInput value={parentTags} setValue={setParentTags} options={parentTagOptions} />
        </View>
      </DialogContent>

      {isConfirmDeleteOpen && <ConfirmDeleteModal setVisible={setIsConfirmDeleteOpen} />}

      <DialogActions className={css.dialogActions}>
        <Button text="Cancel" icon="Close" onClick={onCancel} color={colors.grey["700"]} />

        <Button text="Delete" icon="Delete" onClick={handleDelete} color={colors.red["800"]} />

        <Button text="Confirm" icon="Check" onClick={saveTag} />
      </DialogActions>
    </>
  );
});

const useClasses = makeClasses({
  dialogActions: {
    justifyContent: "center",
  },
  dialogContent: {
    padding: "0.5rem 1rem",
  },
  sectionTitle: {
    fontSize: "0.8em",
    textAlign: "center",
    textShadow: `0 0 10px ${colors.blue["600"]}`,
  },
});
