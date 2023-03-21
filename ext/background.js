browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.removeAll(() => {
    [{ id: "createBookmark", title: "Create Bookmark" }].forEach(({ id, title }) =>
      browser.contextMenus.create({ id, title })
    );
  });
});

browser.contextMenus.onClicked.addListener(({ menuItemId }) => {
  if (menuItemId === "createBookmark") {
    browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      try {
        const isIncognito = tabs[0].incognito;

        const imageUrl = await browser.tabs.captureVisibleTab({ quality: 90 });

        const res = await (
          await fetch("http://localhost:3738/api/bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isIncognito,
              imageUrl,
              pageUrl: tabs[0].url,
              title: tabs[0].title,
            }),
          })
        ).json();

        console.log("Res:", res);
        // show notification from electron
      } catch (err) {
        console.error("Error creating bookmark:", err.message);
      }
    });
  }
});
