# DN (Daily Note)

Dead simple daily notes in your existing editor.

## Usage

```sh
dn [options] [title]
```

#### [options]

`--day`
_The day offset for the notes date. Defaults to 0 (today)_

#### [title]

The title of the note.
_Defaults to the current date in YYYY-MM-DD format which serves as a general daily note._

#### Environment Variables:

##### `DN_EDITOR`

The editor to use when creating a new note.
Defaults: `$EDITOR`

##### `DN_DIR`

The directory to store the daily notes.
Defaults: `~/notes`

### Open Today's Daily Note

```sh
dn
```

### Open Yesterday's Daily Note

```sh
dn --day=-1
```

### Create a Titled Daily Note

```sh
dn Standup Notes
```

### Create a seperate daily note with a title for today

```sh
dn some note title
```

### Create a seperate daily note with a title for 2 days from now

```sh
dn --day=2 some note title
```

## Todo

- [ ] Ability to recall specific days (`--day last monday`, or `--day=YYYY-MM-DD`)
- [ ] Ability to browse/choose which note to open from the target day (`dn --choose`)
