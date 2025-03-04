import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Terminal.module.css';

const Terminal = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { text: 'Can Dağdeviren Terminal v1.0.0', type: 'system' },
    { text: 'Welcome to Terminal. Type "help" to see available commands.', type: 'system' }
  ]);
  const [path, setPath] = useState('~');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoComplete, setAutoComplete] = useState([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [selectedAutoCompleteIndex, setSelectedAutoCompleteIndex] = useState(0);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [multiLineBuffer, setMultiLineBuffer] = useState([]);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const lastOutputRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Terminal visibility animation
  useEffect(() => {
    setIsTerminalVisible(true);
  }, []);

  // Enhanced file system
  const fileSystem = {
    '~': {
      type: 'directory',
      content: {
        'projects': { 
          type: 'directory', 
          content: {
            'portfolio': {
              type: 'directory',
              content: {
                'README.md': {
                  type: 'file',
                  content: '# VS Code Portfolio\n\nThis VS Code themed portfolio website was developed with Next.js and deployed on Vercel.'
                },
                'tech-stack.txt': {
                  type: 'file',
                  content: 'Next.js\nReact\nCSS Modules\nVercel'
                }
              }
            },
            'terminal': {
              type: 'directory',
              content: {
                'commands.txt': {
                  type: 'file',
                  content: 'ls, cd, cat, mkdir, touch, rm, pwd, echo, clear, help, exit, date, version, fortune'
                }
              }
            }
          }
        },
        'about': { 
          type: 'directory',
          content: {
            'cv.txt': {
              type: 'file',
              content: 'Name: Can Dağdeviren\nPosition: Backend Developer\nExperience: 3 years'
            },
            'skills.txt': {
              type: 'file',
              content: 'JavaScript\nNode.js\nReact\nNext.js\nMongoDB\nPostgreSQL'
            }
          }
        },
        'contact.txt': { 
          type: 'file', 
          content: 'Email: candagdevirenn@gmail.com\nGitHub: cndgdvrn\nLinkedIn: candagdeviren' 
        },
        'welcome.txt': {
          type: 'file',
          content: 'Hello, I am Can Dağdeviren! I work as a backend developer and love learning new technologies.'
        }
      }
    }
  };

  // Syntax highlighting function
  const syntaxHighlight = (cmd) => {
    const commands = ['ls', 'cd', 'cat', 'pwd', 'echo', 'help', 'mkdir', 'touch', 'rm', 'clear', 'exit', 'date', 'version', 'fortune'];
    const options = ['-l', '-r', '-rf'];
    
    const parts = cmd.split(' ');
    
    if (commands.includes(parts[0])) {
      parts[0] = `<span class="${styles.commandColor}">${parts[0]}</span>`;
    }
    
    for (let i = 1; i < parts.length; i++) {
      if (options.includes(parts[i])) {
        parts[i] = `<span class="${styles.optionColor}">${parts[i]}</span>`;
      } else if (parts[i].startsWith('"') && parts[i].endsWith('"')) {
        parts[i] = `<span class="${styles.stringColor}">${parts[i]}</span>`;
      }
    }
    
    return parts.join(' ');
  };

  // Process command and route to relevant function
  const processCommand = (cmd) => {
    const args = cmd.trim().split(' ');
    const command = args[0].toLowerCase();
    
    switch(command) {
      case 'clear':
        setHistory([]);
        break;
      case 'ls':
        return handleLs(args);
      case 'cd':
        return handleCd(args);
      case 'cat':
        return handleCat(args);
      case 'pwd':
        return handlePwd();
      case 'echo':
        return handleEcho(args);
      case 'help':
        return handleHelp();
      case 'mkdir':
        return handleMkdir(args);
      case 'touch':
        return handleTouch(args);
      case 'rm':
        return handleRm(args);
      case 'date':
        return handleDate();
      case 'version':
        return handleVersion();
      case 'fortune':
        return handleFortune();
      case 'exit':
        handleExit();
        return '';
      case '':
        return '';
      default:
        // More informative error message
        const similarCommands = ['ls', 'cd', 'cat', 'pwd', 'echo', 'help', 'mkdir', 'touch', 'rm', 'clear', 'exit', 'date', 'version', 'fortune'].filter(
          cmd => cmd.startsWith(command)
        );
        
        if (similarCommands.length > 0) {
          return `${command}: command not found. Did you mean: ${similarCommands.join(', ')}?`;
        }
        
        return `${command}: command not found. Type 'help' to see available commands.`;
    }
  };

  // ls command
  const handleLs = (args) => {
    const currentDir = getCurrentDirectory();
    if (!currentDir || currentDir.type !== 'directory') {
      return 'Invalid directory';
    }

    const hasL = args.includes('-l');
    
    if (hasL) {
      // ls -l long format
      let result = '';
      Object.entries(currentDir.content).forEach(([name, item]) => {
        const type = item.type === 'directory' ? 'd' : '-';
        result += `${type}rwxr-xr-x 1 user staff  ${name}${item.type === 'directory' ? '/' : ''}\n`;
      });
      return result;
    }
    
    // Normal ls
    const coloredOutput = Object.entries(currentDir.content).map(([name, item]) => {
      return item.type === 'directory' ? 
        `<span class="${styles.dirColor}">${name}/</span>` : 
        `<span class="${styles.fileColor}">${name}</span>`;
    }).join('  ');
    
    return { html: coloredOutput };
  };

  // cd command
  const handleCd = (args) => {
    if (args.length < 2 || args[1] === '~') {
      setPath('~');
      return '';
    }

    const targetPath = args[1];
    const currentDir = getCurrentDirectory();

    if (targetPath === '..') {
      if (path === '~') return '';
      const pathParts = path.split('/');
      pathParts.pop();
      setPath(pathParts.join('/') || '~');
      return '';
    }

    if (currentDir.content[targetPath] && currentDir.content[targetPath].type === 'directory') {
      setPath(path === '~' ? `~/${targetPath}` : `${path}/${targetPath}`);
      return '';
    }

    return `cd: ${targetPath}: No such directory`;
  };

  // cat command
  const handleCat = (args) => {
    if (args.length < 2) {
      return 'Usage: cat <file_name>';
    }

    const fileName = args[1];
    const currentDir = getCurrentDirectory();

    if (currentDir.content[fileName] && currentDir.content[fileName].type === 'file') {
      return currentDir.content[fileName].content;
    }

    return `cat: ${fileName}: No such file`;
  };

  // pwd command
  const handlePwd = () => {
    return path.replace('~', '/home/user');
  };

  // echo command
  const handleEcho = (args) => {
    return args.slice(1).join(' ');
  };

  // help command
  const handleHelp = () => {
    return `Available commands:
  ls [-l]                - List directory contents (-l for long format)
  cd <directory>         - Change directory
  cat <file>             - Display file content
  pwd                    - Print working directory
  echo <text>            - Print text
  mkdir <dir_name>       - Create new directory
  touch <file_name>      - Create new file
  rm [-r] <file/dir>     - Remove file or directory (-r for directories)
  clear                  - Clear terminal
  exit                   - Close terminal
  help                   - Show this help menu
  date                   - Show current date and time
  version                - Show terminal version
  fortune                - Get a random programmer quote
  
Tips:
- Use Tab key for auto-completion
- Use Up/Down arrows to navigate auto-completion options
- Press Ctrl+Shift+Enter to switch to multi-line input mode
- Keyboard shortcut: Use Ctrl+\` to open/close the terminal`;
  };

  // mkdir command - create new directory
  const handleMkdir = (args) => {
    if (args.length < 2) {
      return 'Usage: mkdir <dir_name>';
    }

    const dirName = args[1];
    const currentDir = getCurrentDirectory();

    if (currentDir.content[dirName]) {
      return `mkdir: ${dirName}: File or directory already exists`;
    }

    // Create new directory
    currentDir.content[dirName] = {
      type: 'directory',
      content: {}
    };

    return `Directory "${dirName}" created`;
  };

  // touch command - create new file
  const handleTouch = (args) => {
    if (args.length < 2) {
      return 'Usage: touch <file_name>';
    }

    const fileName = args[1];
    const currentDir = getCurrentDirectory();

    if (currentDir.content[fileName]) {
      return ''; // touch silently updates existing files
    }

    // Create new file
    currentDir.content[fileName] = {
      type: 'file',
      content: ''
    };

    return '';
  };

  // rm command - remove file/directory
  const handleRm = (args) => {
    if (args.length < 2) {
      return 'Usage: rm [-r] <file/directory>';
    }

    let isRecursive = false;
    let target = args[1];

    if (args[1] === '-r' || args[1] === '-rf') {
      isRecursive = true;
      target = args[2];
      if (!target) {
        return 'Usage: rm -r <directory>';
      }
    }

    const currentDir = getCurrentDirectory();

    if (!currentDir.content[target]) {
      return `rm: ${target}: No such file or directory`;
    }

    if (currentDir.content[target].type === 'directory' && !isRecursive) {
      return `rm: ${target}: Use -r option to remove a directory`;
    }

    // Delete file/directory
    delete currentDir.content[target];
    return '';
  };
  
  // date command - show date and time
  const handleDate = () => {
    const now = new Date();
    return now.toLocaleString();
  };
  
  // version command - terminal version
  const handleVersion = () => {
    return 'Terminal v1.1.0 - Enhanced Edition\nDeveloped by Can Dağdeviren';
  };
  
  // fortune command - random developer quotes
  const handleFortune = () => {
    const quotes = [
      "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. – Martin Fowler",
      "First, solve the problem. Then, write the code. – John Johnson",
      "Experience is the name everyone gives to their mistakes. – Oscar Wilde",
      "Programming isn't about what you know; it's about what you can figure out. – Chris Pine",
      "The best error message is the one that never shows up. – Thomas Fuchs",
      "The most disastrous thing that you can ever learn is your first programming language. – Alan Kay",
      "The best way to predict the future is to implement it. – David Heinemeier Hansson",
      "Sometimes it's better to leave something alone, to pause, and that's very true of programming. – Joyce Wheeler",
      "It's not a bug – it's an undocumented feature. – Anonymous",
      "If debugging is the process of removing software bugs, then programming must be the process of putting them in. – Edsger W. Dijkstra"
    ];
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };
  
  // exit command - close terminal with animation
  const handleExit = () => {
    setIsTerminalVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Get current directory
  const getCurrentDirectory = () => {
    if (path === '~') return fileSystem['~'];
    
    const pathParts = path.replace('~/', '').split('/');
    let current = fileSystem['~'];
    
    for (const part of pathParts) {
      if (part === '') continue;
      if (current.content[part] && current.content[part].type === 'directory') {
        current = current.content[part];
      } else {
        return null;
      }
    }
    
    return current;
  };

  // Get items for autocompletion from current directory
  const getCompletionItems = (partial) => {
    // Command completion
    if (!input.includes(' ')) {
      const commands = ['ls', 'cd', 'cat', 'pwd', 'echo', 'help', 'mkdir', 'touch', 'rm', 'clear', 'exit', 'date', 'version', 'fortune'];
      return commands.filter(cmd => cmd.startsWith(partial));
    }
    
    // File/directory completion
    const currentDir = getCurrentDirectory();
    if (!currentDir) return [];
    
    return Object.keys(currentDir.content).filter(item => 
      item.startsWith(partial)
    );
  };

  // Multi-line command processing
  const handleMultiLineInput = () => {
    setIsMultiLine(!isMultiLine);
    if (isMultiLine) {
      // Exit from multi-line mode - process all commands
      const fullCommand = [...multiLineBuffer, input].join('\n');
      setHistory(prev => [
        ...prev,
        { text: `user@portfolio:${path}$ Multi-line command:`, type: 'command' },
        { text: fullCommand, type: 'multiline' }
      ]);
      
      // Process each line separately
      [...multiLineBuffer, input].forEach(cmd => {
        if (cmd.trim()) {
          const result = processCommand(cmd);
          setHistory(prev => [
            ...prev,
            { text: `user@portfolio:${path}$ ${cmd}`, type: 'command' },
            ...(result ? [{ text: result, type: 'output' }] : [])
          ]);
        }
      });
      
      setMultiLineBuffer([]);
      setInput('');
    }
  };

  // Execute command
  const executeCommand = () => {
    if (!input.trim()) return;
    
    // In multi-line mode, add to buffer
    if (isMultiLine) {
      setMultiLineBuffer(prev => [...prev, input]);
      setInput('');
      setCursorPosition(0);
      return;
    }
    
    // Add to command history
    setCommandHistory(prev => [input, ...prev]);
    setHistoryIndex(-1);
    
    // Display command and its result
    const result = processCommand(input);
    
    // If it has HTML content, process it
    if (result && typeof result === 'object' && result.html) {
      setHistory(prev => [
        ...prev,
        { 
          html: `<span class="${styles.prompt}">user@portfolio:${path}$</span> ${syntaxHighlight(input)}`, 
          type: 'commandHighlighted' 
        },
        { html: result.html, type: 'output' }
      ]);
    } else {
      setHistory(prev => [
        ...prev,
        { 
          html: `<span class="${styles.prompt}">user@portfolio:${path}$</span> ${syntaxHighlight(input)}`, 
          type: 'commandHighlighted' 
        },
        ...(result ? [{ text: result, type: 'output' }] : [])
      ]);
    }
    
    setInput('');
    setCursorPosition(0);
    setShowAutoComplete(false);
    
    // Terminal auto-scroll - enhanced version
    requestAnimationFrame(() => {
      if (terminalRef.current) {
        const scrollHeight = terminalRef.current.scrollHeight;
        const height = terminalRef.current.clientHeight;
        const maxScroll = scrollHeight - height;
        
        terminalRef.current.scrollTo({
          top: maxScroll,
          behavior: 'smooth'
        });
      }
    });
  };

  // Input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  // Keyboard events
  const handleKeyDown = (e) => {
    // Cursor position update
    setCursorPosition(e.target.selectionStart || 0);

    // Escape key - close terminal or auto-complete
    if (e.key === 'Escape') {
      if (showAutoComplete) {
        setShowAutoComplete(false);
      } else {
        onClose();
      }
      return;
    }

    // Enter key processing
    if (e.key === 'Enter') {
      if (e.ctrlKey && e.shiftKey) {
        handleMultiLineInput();
      } else if (!e.shiftKey) {
        executeCommandWithScroll(); // Using enhanced scroll function instead of executeCommand
      }
      return;
    }
    
    // Left/Right arrow keys - update cursor position
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      requestAnimationFrame(() => {
        setCursorPosition(e.target.selectionStart || 0);
      });
    }
    
    // Up arrow key - navigate back in command history or auto-complete navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showAutoComplete && autoComplete.length > 0) {
        setSelectedAutoCompleteIndex(prev => 
          prev > 0 ? prev - 1 : autoComplete.length - 1
        );
      } else if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const newInput = commandHistory[newIndex];
        setInput(newInput);
        setCursorPosition(newInput.length);
      }
      return;
    }
    
    // Down arrow key - navigate forward in command history or auto-complete navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showAutoComplete && autoComplete.length > 0) {
        setSelectedAutoCompleteIndex(prev => 
          prev < autoComplete.length - 1 ? prev + 1 : 0
        );
      } else if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const newInput = commandHistory[newIndex];
        setInput(newInput);
        setCursorPosition(newInput.length);
      } else {
        setHistoryIndex(-1);
        setInput('');
        setCursorPosition(0);
      }
      return;
    }
    
    // Tab key - auto-complete
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (showAutoComplete && autoComplete.length > 0) {
        // Use selected auto-complete item
        const selectedItem = autoComplete[selectedAutoCompleteIndex];
        const words = input.split(' ');
        words[words.length - 1] = selectedItem;
        setInput(words.join(' '));
        setShowAutoComplete(false);
        return;
      }
      
      const words = input.split(' ');
      const lastWord = words[words.length - 1];
      
      if (lastWord) {
        const completions = getCompletionItems(lastWord);
        
        if (completions.length === 1) {
          // Single match - complete
          words[words.length - 1] = completions[0];
          setInput(words.join(' '));
          setShowAutoComplete(false);
        } else if (completions.length > 1) {
          // Multiple matches - list
          setAutoComplete(completions);
          setSelectedAutoCompleteIndex(0);
          setShowAutoComplete(true);
        }
      }
    }
  };

  // Terminal focus
  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    terminalRef.current?.addEventListener('click', handleClick);
    
    // Terminal opened - focus input area
    inputRef.current?.focus();
    
    return () => {
      terminalRef.current?.removeEventListener('click', handleClick);
    };
  }, []);

  // Keyboard shortcut (Ctrl+`) to close terminal
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === '`') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [onClose]);

  // Cursor position calculation
  const calculateCursorPosition = () => {
    // Calculate prompt width
    const promptWidth = isMultiLine 
      ? `${String(multiLineBuffer.length + 1).length + 2}ch` // Multiline prompt: "1 >"
      : `${path.length + 16}ch`; // Normal prompt: "user@portfolio:~$"
    
    // Calculate cursor position
    return {
      left: `calc(${promptWidth} + ${cursorPosition}ch + 6px)` // Added 6px offset to the right
    };
  };

  // Terminal auto-scroll useEffect
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Terminal DOM changes monitoring useEffect
  useEffect(() => {
    let observer;
    
    // Function to force scroll to bottom
    const forceScrollToBottom = () => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight + 5000;
      }
    };
    
    // When terminal is ready
    if (terminalRef.current && isTerminalVisible) {
      // Find content element
      const contentElement = terminalRef.current.querySelector(`.${styles.content}`);
      
      if (contentElement) {
        // Create MutationObserver
        observer = new MutationObserver(() => {
          // Force scroll to bottom on every change
          forceScrollToBottom();
          
          // Try again with delays to ensure it works
          setTimeout(forceScrollToBottom, 10);
          setTimeout(forceScrollToBottom, 50);
          setTimeout(forceScrollToBottom, 150);
        });
        
        // Start the observer
        observer.observe(contentElement, {
          childList: true,
          subtree: true,
          characterData: true
        });
        
        // Initial scroll
        forceScrollToBottom();
      }
    }
    
    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isTerminalVisible]);

  // Scroll to last output
  const scrollToLastOutput = () => {
    if (lastOutputRef.current) {
      lastOutputRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      
      // Try scrolling again with timeout for reliability
      setTimeout(() => {
        if (lastOutputRef.current) {
          lastOutputRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      }, 50);
    }
  };
  
  // Auto-scroll on terminal content change
  useEffect(() => {
    scrollToLastOutput();
  }, [history]);
  
  // Command execution function
  const executeCommandWithScroll = () => {
    executeCommand();
    
    // Try scrolling multiple times after command execution
    setTimeout(scrollToLastOutput, 0);
    setTimeout(scrollToLastOutput, 50);
    setTimeout(scrollToLastOutput, 100);
    setTimeout(scrollToLastOutput, 200);
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div 
        className={`${styles.terminal} ${isTerminalVisible ? styles.terminalVisible : styles.terminalHidden}`} 
        ref={terminalRef} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.controls}>
            <span className={styles.close} onClick={handleExit}></span>
            <span className={styles.minimize}></span>
            <span className={styles.maximize}></span>
          </div>
          <div className={styles.title}>Terminal {isMultiLine ? '(Multi-line Mode)' : ''}</div>
        </div>
        <div className={styles.content}>
          {history.map((item, index) => (
            <div 
              key={index} 
              className={styles[item.type]}
              ref={index === history.length - 1 ? lastOutputRef : null}
            >
              {item.html ? 
                <div dangerouslySetInnerHTML={{ __html: item.html }} /> : 
                item.text
              }
            </div>
          ))}
          <div className={styles.inputLine}>
            {isMultiLine ? (
              <span className={styles.multilinePrompt}>
                {multiLineBuffer.length + 1} &gt;
              </span>
            ) : (
              <span className={styles.prompt}>user@portfolio:{path}$</span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onSelect={(e) => setCursorPosition(e.target.selectionStart || 0)}
              className={`${styles.input} ${isMultiLine ? styles.multilineInput : ''}`}
              spellCheck="false"
              autoComplete="off"
              autoFocus
            />
            <span 
              className={styles.cursor} 
              style={calculateCursorPosition()}
            ></span>
          </div>
          {showAutoComplete && autoComplete.length > 0 && (
            <div className={styles.autoComplete}>
              {autoComplete.map((item, index) => (
                <div 
                  key={index} 
                  className={`${styles.autoCompleteItem} ${index === selectedAutoCompleteIndex ? styles.selectedItem : ''}`}
                  onClick={() => {
                    const words = input.split(' ');
                    words[words.length - 1] = item;
                    const newInput = words.join(' ');
                    setInput(newInput);
                    setCursorPosition(newInput.length);
                    setShowAutoComplete(false);
                    inputRef.current?.focus();
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Terminal; 