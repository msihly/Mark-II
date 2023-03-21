import { shell } from "@electron/remote";
import { observer } from "mobx-react-lite";
import { Bookmark, useStores } from "store";
import { colors, Chip, Paper } from "@mui/material";
import { Icon, Tag, Text, View } from "components";
import { ContextMenu, BookmarkTooltip } from ".";
import { makeClasses } from "utils";
import Color from "color";

interface BookmarkCardProps {
  bookmark?: Bookmark;
  id?: string;
}

export const BookmarkCard = observer(({ bookmark, id }: BookmarkCardProps) => {
  const { bookmarkStore, tagStore } = useStores();
  if (!bookmark) bookmark = bookmarkStore.getById(id);

  const { css } = useClasses({ selected: bookmark.isSelected });

  const handleTagPress = (tagId: string) => {
    tagStore.setActiveTagId(tagId);
    tagStore.setTagManagerMode("edit");
    tagStore.setIsTagManagerOpen(true);
  };

  const openBookmark = () => shell.openExternal(bookmark.pageUrl);

  return (
    <ContextMenu key="context-menu" bookmark={bookmark} className={`${css.container} selectable`}>
      <Paper onDoubleClick={openBookmark} elevation={3} className={css.paper}>
        <View className={css.imageContainer}>
          <Chip
            icon={<Icon name="Star" color={colors.amber["600"]} size="inherit" />}
            label={bookmark.rating}
            className={css.rating}
          />

          <img
            src={bookmark.imagePath}
            className={css.image}
            alt={bookmark.title}
            draggable={false}
            loading="lazy"
          />

          <Text className={css.title}>{bookmark.title}</Text>
        </View>

        <View row className={css.footer}>
          <View row className={css.tags}>
            {bookmark.tags.slice(0, 5).map((tag) => (
              <Tag key={tag.id} tag={tag} onClick={() => handleTagPress(tag.id)} size="small" />
            ))}
          </View>

          <BookmarkTooltip bookmark={bookmark} onTagPress={handleTagPress} />
        </View>
      </Paper>
    </ContextMenu>
  );
});

const useClasses = makeClasses((theme, { selected }) => ({
  container: {
    flexBasis: "calc(100% / 3)",
    [theme.breakpoints.down("lg")]: { flexBasis: "calc(100% / 2)" },
    [theme.breakpoints.down("md")]: { flexBasis: "calc(100% / 1)" },
    border: "1px solid",
    borderColor: "#0f0f0f",
    borderRadius: 4,
    padding: "0.25rem",
    height: "fit-content",
    background: selected
      ? `linear-gradient(to bottom right, ${colors.blue["800"]}, ${Color(colors.blue["900"])
          .fade(0.5)
          .string()} 60%)`
      : "transparent",
    overflow: "hidden",
    cursor: "pointer",
    userSelect: "none",
  },
  footer: {
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: "inherit",
    borderBottomRightRadius: "inherit",
    padding: "0.2em 0.3em",
    height: "1.8rem",
    backgroundColor: "inherit",
  },
  image: {
    width: "100%",
    minHeight: "9rem",
    objectFit: "cover",
    borderTopLeftRadius: "inherit",
    borderTopRightRadius: "inherit",
    userSelect: "none",
  },
  imageContainer: {
    position: "relative",
    borderTopLeftRadius: "inherit",
    borderTopRightRadius: "inherit",
    backgroundColor: "inherit",
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "auto",
    backgroundColor: colors.grey["900"],
    userSelect: "none",
  },
  rating: {
    position: "absolute",
    top: "0.5rem",
    left: "0.5rem",
    backgroundColor: colors.grey["900"],
    opacity: 0.7,
    cursor: "pointer",
    transition: "all 200ms ease-in-out",
    "&:hover": {
      opacity: 0.85,
    },
  },
  tags: {
    position: "relative",
    overflow: "hidden",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      background: `linear-gradient(to right, transparent 60%, ${colors.grey["900"]})`,
    },
  },
  title: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "0.5rem 0.5rem 0.2rem",
    background: `linear-gradient(to bottom, transparent, rgb(0 0 0 / 0.6))`,
    fontSize: "0.8em",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  tooltip: {
    backgroundColor: colors.grey["900"],
    boxShadow: "rgb(0 0 0 / 50%) 1px 2px 4px 0px",
  },
}));
