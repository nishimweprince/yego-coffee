# Replacing the hero film

The homepage hero is a full-screen video. The two files live together:

```
public/brand/video/hero-coffee.webm         placeholder footage
public/brand/video/hero-coffee-poster.jpg   the still under it
```

Both are referenced from one place — the `FILM` constant at the top of
`src/components/home/hero.tsx`. Swap the files (keeping the names) or
point `FILM` at new ones; nothing else needs to change.

## What is there now, and why it is temporary

`Color sorter coffeebeans.webm` from Wikimedia Commons, released
**CC0** — public domain, no attribution required, safe to ship while
it stands in. 1920×1080, 15.5s, 5.8 MB. It shows picked coffee
cherries, which is on-theme, but it is not Yego's own footage and it
should not survive to launch. The photography shot list already calls
for real roastery and origin film.

## What to supply

- **Landscape, and calm.** It sits under a headline. Anything with a
  hard cut or a fast pan fights the type.
- **Loops without a seam.** It restarts every ~15 seconds forever.
- **Dark, or tolerant of being darkened.** The scrim in
  `globals.css` (`.hero-scrim`) is tuned so the words hold at 7:1
  against this clip. Much brighter footage will need it re-checked.
- **Keep it under ~6 MB.** It downloads on every first visit that
  allows motion.
- **Add an MP4 (H.264) as well.** The placeholder is WebM/VP9 only,
  which older Safari and iOS cannot decode — those visitors currently
  get the poster still, which is a fine fallback but not the intent.
  Drop `hero-coffee.mp4` beside the WebM and add a second `<source>`
  in `hero-video.tsx`, MP4 last.

## The poster still

`hero-coffee-poster.jpg` is the first frame. It is server-rendered with
`priority`, so it is the Largest Contentful Paint element and it is
what a visitor sees when:

- they have asked for reduced motion (the video is never created, and
  never downloaded);
- their browser cannot play the file;
- autoplay is refused by a data saver or battery setting.

So it has to stand on its own as the hero image. Export it from the
first frame of whatever film replaces this one, or the video will
visibly jump when it starts.
