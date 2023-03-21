import { Tooltip, colors } from "@mui/material";
import { Icon, Tag, Text, View } from "components";
import { observer } from "mobx-react-lite";
import { Bookmark } from "store";
import { dayjs, makeClasses } from "utils";

interface BookmarkTooltipProps {
  bookmark: Bookmark;
  onTagPress: (id: string) => any;
}

export const BookmarkTooltip = observer(({ bookmark, onTagPress }: BookmarkTooltipProps) => {
  const { css } = useClasses(null);

  return (
    <Tooltip
      classes={{ tooltip: css.tooltip }}
      title={
        <View column>
          <View column className={css.header}>
            <View row className={css.dates}>
              <Text>{`Created ${dayjs(bookmark.dateCreated).fromNow()}`}</Text>
              <Text margin="0 1em">{"•"}</Text>
              <Text textAlign="right">{`Modified ${dayjs(bookmark.dateModified).fromNow()}`}</Text>
            </View>

            <Text className={css.title}>{bookmark.title}</Text>

            <Text className={css.link}>{bookmark.pageUrl}</Text>
          </View>

          {bookmark.tags?.length > 0 && (
            <View row margins={{ top: "0.3rem", bottom: "0.2rem" }}>
              {bookmark.tags.map((tag) => (
                <Tag key={tag.id} tag={tag} onClick={() => onTagPress(tag.id)} size="small" />
              ))}
            </View>
          )}
        </View>
      }
    >
      <View>
        <Icon
          name="InfoOutlined"
          color={colors.grey["600"]}
          size="1em"
          margins={{ left: "0.3rem" }}
        />
      </View>
    </Tooltip>
  );
});

const useClasses = makeClasses({
  dates: {
    justifyContent: "space-between",
    color: colors.grey["500"],
  },
  header: {
    fontSize: "1.1em",
  },
  link: {
    color: colors.grey["300"],
    textAlign: "center",
  },
  title: {
    color: colors.blue["600"],
    fontWeight: 500,
    textAlign: "center",
  },
  tooltip: {
    maxWidth: "25rem",
    backgroundColor: colors.grey["900"],
    boxShadow: "rgb(0 0 0 / 50%) 1px 2px 4px 0px",
  },
});
