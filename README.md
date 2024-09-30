# dn (daily note)

Dead simple daily notes in your existing editor.

## Usage

```sh
dn [options] [title]
```

#### [options]

`--day` The day offset for the notes date. _Defaults to 0 (today)_

`--dir` The directory to store the daily notes. _Defaults to $DN_DIR environment variable_

`--editor` The editor to use when creating a new note. _Defaults to $DN_EDITOR then $EDITOR environment variables_

`--help` Print this help message

#### [title]

The title of the note.

_Defaults to the current date in YYYY-MM-DD format which serves as a general daily note._

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

### Create a seperate daily note with a title for 2 days from now

```sh
dn --day=2 customer call
```

## Todo

- [ ] Ability to recall specific days (`--day last monday`, or `--day=YYYY-MM-DD`)
- [ ] Ability to carry forward unfinished tasks from previous day to new daily note (`dn --carry`, maybe default?)
