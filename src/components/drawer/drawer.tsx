import { forwardRef } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "store";
import { Divider, Drawer as MuiDrawer, List, colors } from "@mui/material";
import { Checkbox, IconButton, ListItem, TagInput, TagManager, Text, View } from "components";
import { makeClasses } from "utils";
import * as Media from "media";

export const Drawer = observer(
  forwardRef((_, drawerRef: any) => {
    const { homeStore, tagStore } = useStores();

    const { css } = useClasses({ drawerMode: homeStore.drawerMode });

    const handleDescendants = () => homeStore.setIncludeDescendants(!homeStore.includeDescendants);

    const handleManageTags = () => {
      tagStore.setTagManagerMode("search");
      tagStore.setIsTagManagerOpen(true);
    };

    const handleTagged = () => {
      if (!homeStore.includeTagged && !homeStore.includeUntagged) homeStore.setIncludeTagged(true);
      else if (homeStore.includeTagged) {
        homeStore.setIncludeTagged(false);
        homeStore.setIncludeUntagged(true);
      } else homeStore.setIncludeUntagged(false);
    };

    const toggleArchiveOpen = () => homeStore.setIsArchiveOpen(!homeStore.isArchiveOpen);

    return (
      <MuiDrawer
        PaperProps={{ className: css.drawer, ref: drawerRef }}
        ModalProps={{ keepMounted: true }}
        open={homeStore.isDrawerOpen}
        onClose={() => homeStore.setIsDrawerOpen(false)}
        variant={homeStore.drawerMode}
      >
        <View className={css.topActions}>
          <IconButton name="Menu" onClick={() => homeStore.setIsDrawerOpen(false)} size="medium" />

          <IconButton onClick={homeStore.toggleDrawerMode} size="medium">
            <Media.PinSVG className={css.pin} />
          </IconButton>
        </View>

        <List>
          <ListItem text="Manage Tags" icon="More" onClick={handleManageTags} />

          <ListItem
            text={`${homeStore.isArchiveOpen ? "Close" : "Open"} Archive`}
            icon={homeStore.isArchiveOpen ? "Unarchive" : "Archive"}
            onClick={toggleArchiveOpen}
          />
        </List>

        <Divider variant="middle" />

        <Text className={css.inputTitle}>Include</Text>
        <TagInput
          value={[...homeStore.includedTags]}
          setValue={(val) => homeStore.setIncludedTags(val)}
          options={[...tagStore.tagOptions]}
          limitTags={3}
          className={css.input}
        />

        <Text className={css.inputTitle}>Exclude</Text>
        <TagInput
          value={[...homeStore.excludedTags]}
          setValue={(val) => homeStore.setExcludedTags(val)}
          options={[...tagStore.tagOptions]}
          limitTags={3}
          className={css.input}
        />

        <View className={css.checkboxes} column>
          <Checkbox
            label="Descendants"
            checked={homeStore.includeDescendants}
            setChecked={handleDescendants}
          />

          <Checkbox
            label="Tagged"
            checked={homeStore.includeTagged}
            indeterminate={homeStore.includeUntagged}
            setChecked={handleTagged}
          />
        </View>

        {tagStore.isTagManagerOpen && <TagManager />}
      </MuiDrawer>
    );
  })
);

const useClasses = makeClasses((_, { drawerMode }) => ({
  checkboxes: {
    padding: "0.3rem",
    width: "100%",
  },
  drawer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRight: "1px solid #111",
    width: "200px",
    backgroundColor: colors.grey["900"],
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  input: {
    padding: "0.1rem 0.4rem",
    width: "192px",
  },
  pin: {
    padding: "0.2rem",
    fill: "white",
    transform: `rotate(${drawerMode === "persistent" ? "0" : "30"}deg)`,
  },
  inputTitle: {
    marginTop: "0.3rem",
    fontSize: "0.8em",
    textAlign: "center",
    textShadow: `0 0 10px ${colors.blue["600"]}`,
  },
  topActions: {
    display: "flex",
    flexFlow: "row nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.3rem 0.5rem",
    width: "100%",
  },
}));
