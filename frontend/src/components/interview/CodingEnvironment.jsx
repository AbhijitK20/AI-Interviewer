import { useState, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { Play, RotateCcw, CheckCircle, XCircle, Loader2, Terminal, Clock } from 'lucide-react'

const LANGUAGES = [
  { id: 'python', name: 'Python', judge0Id: 71, monacoId: 'python' },
  { id: 'java', name: 'Java', judge0Id: 62, monacoId: 'java' },
  { id: 'javascript', name: 'JavaScript', judge0Id: 63, monacoId: 'javascript' },
  { id: 'cpp', name: 'C++', judge0Id: 54, monacoId: 'cpp' },
  { id: 'c', name: 'C', judge0Id: 50, monacoId: 'c' },
  { id: 'csharp', name: 'C#', judge0Id: 51, monacoId: 'csharp' },
  { id: 'go', name: 'Go', judge0Id: 60, monacoId: 'go' },
  { id: 'rust', name: 'Rust', judge0Id: 73, monacoId: 'rust' },
  { id: 'typescript', name: 'TypeScript', judge0Id: 74, monacoId: 'typescript' },
]

const DEFAULT_CODE = {
  python: `import sys

def solution(lines):
    # lines: input lines (list of strings)
    # Write your solution here, return the result as a string
    return ""

if __name__ == "__main__":
    data = sys.stdin.read().splitlines()
    print(solution(data))
`,
  java: `import java.util.*;

public class Main {
    public static String solution(List<String> lines) {
        // lines: input lines
        // Write your solution here, return the result as a string
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<String> lines = new ArrayList<>();
        while (sc.hasNextLine()) {
            lines.add(sc.nextLine().stripTrailing());
        }
        System.out.println(solution(lines));
    }
}
`,
  javascript: `const fs = require('fs');

function solution(lines) {
    // lines: input lines (array of strings)
    // Write your solution here, return the result as a string
    return "";
}

const lines = fs.readFileSync(0, 'utf-8').split('\\n').map(l => l.trimEnd());
if (lines.length && lines[lines.length - 1] === '') lines.pop();
console.log(solution(lines));
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

string solution(const vector<string>& lines) {
    // lines: input lines
    // Write your solution here, return the result as a string
    return "";
}

int main() {
    vector<string> lines;
    string line;
    while (getline(cin, line)) {
        while (!line.empty() && (line.back() == ' ' || line.back() == '\\r' || line.back() == '\\t'))
            line.pop_back();
        lines.push_back(line);
    }
    cout << solution(lines) << endl;
    return 0;
}
`,
  c: `#include <stdio.h>
#include <string.h>

/* lines: input lines, n: number of lines.
   Write the answer into result. */
void solve(char lines[][1024], int n, char* result) {
    result[0] = '\\0';
}

int main() {
    static char lines[64][1024];
    int n = 0;
    while (n < 64 && fgets(lines[n], 1024, stdin)) {
        size_t len = strlen(lines[n]);
        while (len > 0 && (lines[n][len-1] == '\\n' || lines[n][len-1] == '\\r'
               || lines[n][len-1] == ' ' || lines[n][len-1] == '\\t'))
            lines[n][--len] = '\\0';
        n++;
    }
    static char result[8192];
    solve(lines, n, result);
    printf("%s\\n", result);
    return 0;
}
`,
  csharp: `using System;
using System.Collections.Generic;

class Program {
    static string Solution(List<string> lines) {
        // lines: input lines
        // Write your solution here, return the result as a string
        return "";
    }

    static void Main() {
        var lines = new List<string>();
        string line;
        while ((line = Console.ReadLine()) != null) {
            lines.Add(line.TrimEnd());
        }
        Console.WriteLine(Solution(lines));
    }
}
`,
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func solution(lines []string) string {
	// lines: input lines
	// Write your solution here, return the result as a string
	return ""
}

func main() {
	var lines []string
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Buffer(make([]byte, 1024*1024), 1024*1024)
	for scanner.Scan() {
		lines = append(lines, strings.TrimRight(scanner.Text(), " \\t\\r"))
	}
	fmt.Println(solution(lines))
}
`,
  rust: `use std::io::{self, Read};

fn solution(lines: &[String]) -> String {
    // lines: input lines
    // Write your solution here, return the result as a string
    String::new()
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let lines: Vec<String> = input.lines().map(|l| l.trim_end().to_string()).collect();
    println!("{}", solution(&lines));
}
`,
  typescript: `declare function require(name: string): any;
const fs = require('fs');

function solution(lines: string[]): string {
    // lines: input lines
    // Write your solution here, return the result as a string
    return "";
}

const lines: string[] = fs.readFileSync(0, 'utf-8').split('\\n').map((l: string) => l.trimEnd());
if (lines.length && lines[lines.length - 1] === '') lines.pop();
console.log(solution(lines));
`,
}

const CodingEnvironment = ({ problem, onSubmit, timeLimit = 30 }) => {
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState(DEFAULT_CODE.python)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60)
  const [showTerminal, setShowTerminal] = useState(true)

  const editorRef = useRef(null)
  const timerRef = useRef(null)

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    setCode(DEFAULT_CODE[newLang] || '')
    setOutput(null)
    setTestResults([])
  }

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode()
    })
  }

  const runCode = useCallback(async () => {
    if (!code.trim()) return

    setIsRunning(true)
    setOutput(null)

    try {
      const selectedLang = LANGUAGES.find((l) => l.id === language)

      const response = await fetch('/api/coding/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          languageId: selectedLang.judge0Id,
          sourceCode: code,
          stdin: input,
        }),
      })

      const result = await response.json()
      setOutput(result)
    } catch (err) {
      setOutput({
        status: { description: 'Error' },
        stderr: 'Failed to execute code. Please try again.',
      })
    } finally {
      setIsRunning(false)
    }
  }, [code, input, language])

  const submitCode = useCallback(async () => {
    if (!code.trim()) return

    setIsSubmitting(true)
    setTestResults([])

    try {
      const selectedLang = LANGUAGES.find((l) => l.id === language)

      const response = await fetch('/api/coding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          problemId: problem?.id,
          languageId: selectedLang.judge0Id,
          language: language,
          sourceCode: code,
        }),
      })

      const result = await response.json()
      setTestResults(result.testResults || [])
      onSubmit?.(result)
    } catch (err) {
      setTestResults([{ passed: false, error: 'Submission failed' }])
    } finally {
      setIsSubmitting(false)
    }
  }, [code, language, problem, onSubmit])

  const resetCode = () => {
    setCode(DEFAULT_CODE[language] || '')
    setOutput(null)
    setTestResults([])
  }

  const startTimer = useCallback(() => {
    if (timerRef.current) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-500'
    const desc = status.description?.toLowerCase() || ''
    if (desc.includes('accepted') || desc.includes('success')) return 'text-green-600'
    if (desc.includes('error') || desc.includes('wrong')) return 'text-red-600'
    if (desc.includes('time')) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:ring-primary-500 focus:border-primary-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className={`font-mono ${timeRemaining < 60 ? 'text-red-400' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetCode}
            className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>
          <button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className="flex items-center px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            Run
          </button>
          <button
            onClick={submitCode}
            disabled={isSubmitting || !code.trim()}
            className="flex items-center px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-1" />
            )}
            Submit
          </button>
        </div>
      </div>

      {/* Problem Statement */}
      {problem && (
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 max-h-40 overflow-y-auto">
          <h3 className="text-white font-medium mb-2">{problem.title}</h3>
          <p className="text-gray-300 text-sm">{problem.description}</p>
          {(problem.inputFormat || problem.outputFormat) && (
            <div className="mt-2 text-xs text-gray-400 space-y-1">
              {problem.inputFormat && (
                <p><span className="text-gray-500">Input format:</span> <span className="whitespace-pre-wrap">{problem.inputFormat}</span></p>
              )}
              {problem.outputFormat && (
                <p><span className="text-gray-500">Output format:</span> <span className="whitespace-pre-wrap">{problem.outputFormat}</span></p>
              )}
            </div>
          )}
          {problem.examples && (
            <div className="mt-2">
              {problem.examples.map((example, idx) => (
                <div key={idx} className="mt-2 p-2 bg-gray-700 rounded text-xs font-mono">
                  <p className="text-gray-400">Example {idx + 1}:</p>
                  <p className="text-gray-300 whitespace-pre-wrap">Input: {example.input}</p>
                  <p className="text-gray-300 whitespace-pre-wrap">Output: {example.output}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={LANGUAGES.find((l) => l.id === language)?.monacoId || 'python'}
          value={code}
          onChange={setCode}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            padding: { top: 16 },
          }}
        />
      </div>

      {/* Terminal / Output */}
      <div className={`border-t border-gray-700 ${showTerminal ? 'h-48' : 'h-10'}`}>
        <div
          className="flex items-center justify-between px-4 py-2 bg-gray-800 cursor-pointer"
          onClick={() => setShowTerminal(!showTerminal)}
        >
          <div className="flex items-center space-x-2 text-gray-300">
            <Terminal className="w-4 h-4" />
            <span className="text-sm">Output</span>
          </div>
          <span className="text-gray-500 text-xs">
            {showTerminal ? '▼' : '▲'}
          </span>
        </div>

        {showTerminal && (
          <div className="h-36 overflow-y-auto bg-gray-900 p-4 font-mono text-sm">
            {/* Input */}
            <div className="mb-3">
              <label className="text-gray-500 text-xs block mb-1">Input (stdin):</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-12 bg-gray-800 text-gray-300 rounded p-2 text-xs resize-none border border-gray-700 focus:border-primary-500 focus:outline-none"
                placeholder="Enter input for your program..."
              />
            </div>

            {/* Output */}
            {output && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Status:</span>
                  <span className={getStatusColor(output.status)}>
                    {output.status?.description || 'Unknown'}
                  </span>
                </div>

                {output.stdout && (
                  <div>
                    <span className="text-gray-500">Output:</span>
                    <pre className="text-green-400 whitespace-pre-wrap mt-1">{output.stdout}</pre>
                  </div>
                )}

                {output.stderr && (
                  <div>
                    <span className="text-gray-500">Error:</span>
                    <pre className="text-red-400 whitespace-pre-wrap mt-1">{output.stderr}</pre>
                  </div>
                )}

                {output.compile_output && (
                  <div>
                    <span className="text-gray-500">Compile Output:</span>
                    <pre className="text-yellow-400 whitespace-pre-wrap mt-1">{output.compile_output}</pre>
                  </div>
                )}

                {output.time && (
                  <div className="text-gray-500 text-xs">
                    Execution time: {output.time}s | Memory: {output.memory} KB
                  </div>
                )}
              </div>
            )}

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="mt-3 border-t border-gray-700 pt-3">
                <span className="text-gray-400 text-xs">Test Results:</span>
                <div className="mt-2 space-y-1">
                  {testResults.map((result, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center space-x-2">
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-gray-300">
                          {result.testName || `Test ${idx + 1}`}: {result.passed ? 'Passed' : 'Failed'}
                        </span>
                        {result.error && (
                          <span className="text-red-400">- {result.error}</span>
                        )}
                      </div>
                      {!result.passed && result.expectedOutput !== undefined && (
                        <div className="ml-6 mt-1 text-gray-400 font-mono">
                          <p>Expected: <span className="text-green-400 whitespace-pre-wrap">{result.expectedOutput}</span></p>
                          <p>Actual: <span className="text-red-400 whitespace-pre-wrap">{result.actualOutput || '(no output)'}</span></p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!output && testResults.length === 0 && (
              <p className="text-gray-600">Run your code to see output here...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CodingEnvironment
