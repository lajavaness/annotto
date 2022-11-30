import { UnControlled as CodeMirror } from 'react-codemirror2'
import React, { useState } from 'react'
import jsonlint from 'jsonlint-mod'

import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/lint/json-lint.js'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/mode/javascript/javascript'

import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/neat.css'

window.jsonlint = jsonlint

const JsonEditor = ({ ...props }) => {
  const [mounted, setMounted] = useState(false)

  const _onEditorDidMount = () => setMounted(true)

  return (
    <CodeMirror
      {...props}
      editorDidMount={_onEditorDidMount}
      autoScroll={false}
      autoCursor={false}
      options={{
        mode: 'application/json',
        theme: 'neat',
        lineNumbers: true,
        smartIndent: true,
        lint: mounted,
        tabSize: 2,
        foldGutter: true,
        selfContain: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      }}
    />
  )
}

export default JsonEditor
