
# editable

  Fixing `contenteditable`.

#### Goals
  
  Provide Editor authors with the ability to simply create a UI without thinking
  of the resulting html output, html sanitization or `UndoManager`.

  This might result in multiple tiny components, that each solve a problem `contenteditable` has,
  then Editor authors can simply pick features by installing `editable-*` components and build a UI.

#### Why not use Aloha, RedactorJS etc..

  Both editors are awesome, but they both have large bloated dependencies, such as
  UI components, rangy, jQuery etc..

  Moreover Aloha is 1mb of source code, arguably both cannot be used because of their license.

#### Installation
  
    $ component install yields/editable

#### License

  MIT
