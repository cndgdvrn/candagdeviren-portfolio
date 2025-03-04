import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Terminal.module.css';

const Terminal = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { text: 'Can Dağdeviren Terminal v1.0.0', type: 'system' },
    { text: 'Terminal\'e hoş geldiniz. Komutları görmek için "help" yazın.', type: 'system' }
  ]);
  const [path, setPath] = useState('~');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoComplete, setAutoComplete] = useState([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Geliştirilmiş dosya sistemi
  const fileSystem = {
    '~': {
      type: 'directory',
      content: {
        'projeler': { 
          type: 'directory', 
          content: {
            'portfolio': {
              type: 'directory',
              content: {
                'README.md': {
                  type: 'file',
                  content: '# VS Code Portföy\n\nBu VS Code temalı portföy sitesi Next.js ile geliştirildi ve Vercel üzerinde deploy edildi.'
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
                'komutlar.txt': {
                  type: 'file',
                  content: 'ls, cd, cat, mkdir, touch, rm, pwd, echo, clear, help, exit'
                }
              }
            }
          }
        },
        'hakkimda': { 
          type: 'directory',
          content: {
            'cv.txt': {
              type: 'file',
              content: 'İsim: Can Dağdeviren\nPozisyon: Backend Geliştirici\nTecrübe: 3 yıl'
            },
            'yetenekler.txt': {
              type: 'file',
              content: 'JavaScript\nNode.js\nReact\nNext.js\nMongoDB\nPostgreSQL'
            }
          }
        },
        'iletisim.txt': { 
          type: 'file', 
          content: 'E-posta: candagdevirenn@gmail.com\nGitHub: cndgdvrn\nLinkedIn: candagdeviren' 
        },
        'hosgeldin.txt': {
          type: 'file',
          content: 'Merhaba, ben Can Dağdeviren! Backend geliştirici olarak çalışıyorum ve yeni teknolojileri öğrenmeyi seviyorum.'
        }
      }
    }
  };

  // Komutu işleme ve ilgili fonksiyona yönlendirme
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
      case 'exit':
        onClose();
        return '';
      case '':
        return '';
      default:
        return `${command}: komut bulunamadı. Komutları görmek için 'help' yazın.`;
    }
  };

  // ls komutu
  const handleLs = (args) => {
    const currentDir = getCurrentDirectory();
    if (!currentDir || currentDir.type !== 'directory') {
      return 'Geçerli bir dizin değil';
    }

    const hasL = args.includes('-l');
    
    if (hasL) {
      // ls -l uzun format
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

  // cd komutu
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

    return `cd: ${targetPath}: Böyle bir dizin yok`;
  };

  // cat komutu
  const handleCat = (args) => {
    if (args.length < 2) {
      return 'Kullanım: cat <dosya_adı>';
    }

    const fileName = args[1];
    const currentDir = getCurrentDirectory();

    if (currentDir.content[fileName] && currentDir.content[fileName].type === 'file') {
      return currentDir.content[fileName].content;
    }

    return `cat: ${fileName}: Böyle bir dosya yok`;
  };

  // pwd komutu
  const handlePwd = () => {
    return path.replace('~', '/home/user');
  };

  // echo komutu
  const handleEcho = (args) => {
    return args.slice(1).join(' ');
  };

  // help komutu
  const handleHelp = () => {
    return `Kullanılabilir komutlar:
  ls [-l]                - Dizin içeriğini listele (-l uzun format)
  cd <dizin>             - Dizin değiştir
  cat <dosya>            - Dosya içeriğini göster
  pwd                    - Mevcut dizin yolunu göster
  echo <metin>           - Metni ekrana yazdır
  mkdir <dizin_adı>      - Yeni dizin oluştur
  touch <dosya_adı>      - Yeni dosya oluştur
  rm [-r] <dosya/dizin>  - Dosya veya dizin sil (-r dizinler için)
  clear                  - Terminali temizle
  exit                   - Terminali kapat
  help                   - Yardım menüsünü göster
  
İpucu: Tab tuşu ile otomatik tamamlama yapabilirsiniz.
Klavye kısayolu: Terminali açmak/kapatmak için Ctrl+\` kullanabilirsiniz.`;
  };

  // mkdir komutu - yeni dizin oluşturma
  const handleMkdir = (args) => {
    if (args.length < 2) {
      return 'Kullanım: mkdir <dizin_adı>';
    }

    const dirName = args[1];
    const currentDir = getCurrentDirectory();

    if (currentDir.content[dirName]) {
      return `mkdir: ${dirName}: Dosya veya dizin zaten mevcut`;
    }

    // Yeni dizin oluştur
    currentDir.content[dirName] = {
      type: 'directory',
      content: {}
    };

    return `"${dirName}" dizini oluşturuldu`;
  };

  // touch komutu - yeni dosya oluşturma
  const handleTouch = (args) => {
    if (args.length < 2) {
      return 'Kullanım: touch <dosya_adı>';
    }

    const fileName = args[1];
    const currentDir = getCurrentDirectory();

    if (currentDir.content[fileName]) {
      return ''; // touch mevcut dosyaları sessizce günceller
    }

    // Yeni dosya oluştur
    currentDir.content[fileName] = {
      type: 'file',
      content: ''
    };

    return '';
  };

  // rm komutu - dosya/dizin silme
  const handleRm = (args) => {
    if (args.length < 2) {
      return 'Kullanım: rm [-r] <dosya/dizin>';
    }

    let isRecursive = false;
    let target = args[1];

    if (args[1] === '-r' || args[1] === '-rf') {
      isRecursive = true;
      target = args[2];
      if (!target) {
        return 'Kullanım: rm -r <dizin>';
      }
    }

    const currentDir = getCurrentDirectory();

    if (!currentDir.content[target]) {
      return `rm: ${target}: Böyle bir dosya veya dizin yok`;
    }

    if (currentDir.content[target].type === 'directory' && !isRecursive) {
      return `rm: ${target}: Bir dizini silmek için -r seçeneğini kullanın`;
    }

    // Dosya/dizini sil
    delete currentDir.content[target];
    return '';
  };

  // Mevcut dizini alma
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

  // Otomatik tamamlama için mevcut dizindeki öğeleri alma
  const getCompletionItems = (partial) => {
    const currentDir = getCurrentDirectory();
    if (!currentDir) return [];
    
    return Object.keys(currentDir.content).filter(item => 
      item.startsWith(partial)
    );
  };

  // Komut çalıştırma
  const executeCommand = () => {
    if (!input.trim()) return;
    
    // Komut geçmişine ekle
    setCommandHistory(prev => [input, ...prev]);
    setHistoryIndex(-1);
    
    // Komutu ve sonucunu ekrana yaz
    const result = processCommand(input);
    
    // HTML içeriği varsa onu işle
    if (result && typeof result === 'object' && result.html) {
      setHistory(prev => [
        ...prev,
        { text: `user@portfolio:${path}$ ${input}`, type: 'command' },
        { html: result.html, type: 'output' }
      ]);
    } else {
      setHistory(prev => [
        ...prev,
        { text: `user@portfolio:${path}$ ${input}`, type: 'command' },
        ...(result ? [{ text: result, type: 'output' }] : [])
      ]);
    }
    
    setInput('');
    setShowAutoComplete(false);
    
    // Terminal otomatik kaydırma
    setTimeout(() => {
      terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
    }, 10);
  };

  // Klavye olayları
  const handleKeyDown = (e) => {
    // Enter tuşu - komutu çalıştır
    if (e.key === 'Enter') {
      executeCommand();
      return;
    }
    
    // Yukarı ok tuşu - komut geçmişinde geriye git
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
      return;
    }
    
    // Aşağı ok tuşu - komut geçmişinde ileriye git
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }
    
    // Tab tuşu - otomatik tamamlama
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const words = input.split(' ');
      const lastWord = words[words.length - 1];
      
      if (lastWord) {
        const completions = getCompletionItems(lastWord);
        
        if (completions.length === 1) {
          // Tek eşleşme varsa tamamla
          words[words.length - 1] = completions[0];
          setInput(words.join(' '));
          setShowAutoComplete(false);
        } else if (completions.length > 1) {
          // Birden fazla eşleşme varsa listele
          setAutoComplete(completions);
          setShowAutoComplete(true);
        }
      }
    }
    
    // Escape tuşu - otomatik tamamlama penceresini kapat
    if (e.key === 'Escape') {
      setShowAutoComplete(false);
    }
  };

  // Terminale odaklanma
  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    terminalRef.current?.addEventListener('click', handleClick);
    
    // Terminal açıldığında input alanına odaklan
    inputRef.current?.focus();
    
    return () => {
      terminalRef.current?.removeEventListener('click', handleClick);
    };
  }, []);

  // Klavye kısayolu (Ctrl+`) ile terminali kapatma
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

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.terminal} ref={terminalRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.controls}>
            <span className={styles.close} onClick={onClose}></span>
            <span className={styles.minimize}></span>
            <span className={styles.maximize}></span>
          </div>
          <div className={styles.title}>Terminal</div>
        </div>
        <div className={styles.content}>
          {history.map((item, index) => (
            <div key={index} className={styles[item.type]}>
              {item.html ? 
                <div dangerouslySetInnerHTML={{ __html: item.html }} /> : 
                item.text
              }
            </div>
          ))}
          <div className={styles.inputLine}>
            <span className={styles.prompt}>user@portfolio:{path}$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
              spellCheck="false"
              autoComplete="off"
              autoFocus
            />
          </div>
          {showAutoComplete && autoComplete.length > 0 && (
            <div className={styles.autoComplete}>
              {autoComplete.map((item, index) => (
                <div 
                  key={index} 
                  className={styles.autoCompleteItem}
                  onClick={() => {
                    const words = input.split(' ');
                    words[words.length - 1] = item;
                    setInput(words.join(' '));
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