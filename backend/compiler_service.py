import os
import sys
import shutil
import subprocess
import time
import uuid
import logging
import re
import ast
import json
import traceback
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path

logger = logging.getLogger("voxcode.compiler.v2")

class CompilerService:
    """
    Extreme In-Built Compiler & Code Execution Engine v2.0 for VoxCode.
    Features:
    - 10+ Multi-Language Execution with OS PATH Probing
    - Deep AST Security & Vulnerability Audit Engine (0-100 Safety Score)
    - Structured Error & Line-Number Parsing (Jump-to-Line Support)
    - Multi-Mode Execution: Standard, Security Audit, Trace/Memory Profiling, and Unit Test Benchmarking
    - Missing Package & Dependency Recommendations
    """
    def __init__(self, sandbox_dir: str = None):
        if sandbox_dir:
            self.sandbox_dir = Path(sandbox_dir)
        else:
            base_dir = Path(__file__).parent / "data" / "sandbox"
            self.sandbox_dir = base_dir
        
        self.sandbox_dir.mkdir(parents=True, exist_ok=True)
        
        # Language configurations
        self.lang_config = {
            "python": {
                "ext": ".py",
                "compile": None,
                "run": [sys.executable, "{file}"],
                "version_cmd": [sys.executable, "--version"],
                "name": "Python 3"
            },
            "javascript": {
                "ext": ".js",
                "compile": None,
                "run": ["node", "{file}"],
                "version_cmd": ["node", "--version"],
                "name": "Node.js"
            },
            "typescript": {
                "ext": ".ts",
                "compile": ["tsc", "{file}", "--target", "es2022", "--module", "commonjs", "--outfile", "{dir}/out.js"],
                "run": ["node", "{dir}/out.js"],
                "version_cmd": ["tsc", "--version"],
                "name": "TypeScript"
            },
            "cpp": {
                "ext": ".cpp",
                "compile": ["g++", "-O2", "{file}", "-o", "{dir}/exe_out"],
                "run": ["{dir}/exe_out"],
                "version_cmd": ["g++", "--version"],
                "name": "C++ (g++)"
            },
            "c": {
                "ext": ".c",
                "compile": ["gcc", "-O2", "{file}", "-o", "{dir}/exe_out"],
                "run": ["{dir}/exe_out"],
                "version_cmd": ["gcc", "--version"],
                "name": "C (gcc)"
            },
            "java": {
                "ext": ".java",
                "compile": ["javac", "-d", "{dir}", "{file}"],
                "run": ["java", "-cp", "{dir}", "Main"],
                "version_cmd": ["javac", "-version"],
                "name": "Java (JDK)"
            },
            "rust": {
                "ext": ".rs",
                "compile": ["rustc", "-O", "{file}", "-o", "{dir}/exe_out"],
                "run": ["{dir}/exe_out"],
                "version_cmd": ["rustc", "--version"],
                "name": "Rust"
            },
            "go": {
                "ext": ".go",
                "compile": None,
                "run": ["go", "run", "{file}"],
                "version_cmd": ["go", "version"],
                "name": "Go"
            },
            "php": {
                "ext": ".php",
                "compile": None,
                "run": ["php", "-f", "{file}"],
                "version_cmd": ["php", "--version"],
                "name": "PHP"
            },
            "ruby": {
                "ext": ".rb",
                "compile": None,
                "run": ["ruby", "{file}"],
                "version_cmd": ["ruby", "--version"],
                "name": "Ruby"
            },
            "csharp": {
                "ext": ".cs",
                "compile": None,
                "run": ["dotnet", "script", "{file}"],
                "version_cmd": ["dotnet", "--version"],
                "name": "C# (.NET)"
            }
        }
        
        self._installed_compilers = {}
        self.probe_installed_compilers()

    def probe_installed_compilers(self) -> Dict[str, Any]:
        """Probes local OS PATH to check available compilers and interpreters."""
        installed = {}
        for lang, cfg in self.lang_config.items():
            cmd_name = cfg["version_cmd"][0]
            if shutil.which(cmd_name):
                try:
                    res = subprocess.run(cfg["version_cmd"], capture_output=True, text=True, timeout=3)
                    version_str = (res.stdout or res.stderr).strip().split('\n')[0]
                    installed[lang] = {
                        "available": True,
                        "version": version_str,
                        "name": cfg["name"]
                    }
                except Exception:
                    installed[lang] = {
                        "available": True,
                        "version": f"Installed ({cmd_name})",
                        "name": cfg["name"]
                    }
            else:
                installed[lang] = {
                    "available": False,
                    "version": "Not installed in OS PATH",
                    "name": cfg["name"]
                }
        self._installed_compilers = installed
        return installed

    def get_supported_languages(self) -> Dict[str, Any]:
        if not self._installed_compilers:
            self.probe_installed_compilers()
        return self._installed_compilers

    # ─── 1. Deep AST & Security Audit Engine ───

    def analyze_security(self, code: str, language: str) -> Dict[str, Any]:
        """
        Enterprise Security & AST Vulnerability Scanner.
        Returns a structured risk profile, safety score (0-100), and specific line-item findings.
        """
        lang_key = language.lower()
        findings = []
        score = 100
        
        if lang_key == "python":
            try:
                tree = ast.parse(code)
                for node in ast.walk(tree):
                    # Check imports
                    if isinstance(node, (ast.Import, ast.ImportFrom)):
                        names = [alias.name for alias in node.names] if isinstance(node, ast.Import) else [node.module]
                        for mod in names:
                            if not mod: continue
                            mod_base = mod.split('.')[0]
                            if mod_base in ['subprocess', 'os', 'shutil', 'ctypes', 'pty']:
                                findings.append({
                                    "level": "HIGH",
                                    "category": "System / Subprocess",
                                    "message": f"Sensitive system manipulation module '{mod_base}' imported.",
                                    "line": getattr(node, 'lineno', 1)
                                })
                                score -= 25
                            elif mod_base in ['socket', 'urllib', 'requests', 'http', 'ftplib', 'telnetlib']:
                                findings.append({
                                    "level": "MEDIUM",
                                    "category": "Network Access",
                                    "message": f"Network communication module '{mod_base}' imported.",
                                    "line": getattr(node, 'lineno', 1)
                                })
                                score -= 15
                            elif mod_base in ['pickle', 'marshal', 'shelve']:
                                findings.append({
                                    "level": "MEDIUM",
                                    "category": "Insecure Deserialization",
                                    "message": f"Insecure serialization module '{mod_base}' imported.",
                                    "line": getattr(node, 'lineno', 1)
                                })
                                score -= 15

                    # Check while loops for infinite loop risk
                    elif isinstance(node, ast.While):
                        # Check if while True or while 1
                        is_infinite = False
                        if isinstance(node.test, ast.Constant) and node.test.value in [True, 1]:
                            is_infinite = True
                        elif isinstance(node.test, ast.Name) and node.test.id == "True":
                            is_infinite = True
                            
                        if is_infinite:
                            # Check if break exists inside loop body
                            has_break = any(isinstance(sub, ast.Break) for sub in ast.walk(node))
                            if not has_break:
                                findings.append({
                                    "level": "HIGH",
                                    "category": "Infinite Loop Risk",
                                    "message": "Unconditional 'while True:' loop detected without a 'break' statement. Risk of CPU hang/timeout.",
                                    "line": getattr(node, 'lineno', 1)
                                })
                                score -= 30
                            else:
                                findings.append({
                                    "level": "LOW",
                                    "category": "Control Flow",
                                    "message": "'while True:' loop detected with internal 'break' condition.",
                                    "line": getattr(node, 'lineno', 1)
                                })
                                score -= 5

                    # Check function calls
                    elif isinstance(node, ast.Call):
                        func_name = ""
                        if isinstance(node.func, ast.Name):
                            func_name = node.func.id
                        elif isinstance(node.func, ast.Attribute):
                            func_name = node.func.attr
                            
                        if func_name in ['eval', 'exec']:
                            findings.append({
                                "level": "CRITICAL",
                                "category": "Dynamic Code Execution",
                                "message": f"Dangerous dynamic execution call '{func_name}()' detected.",
                                "line": getattr(node, 'lineno', 1)
                                })
                            score -= 40
                        elif func_name in ['system', 'popen', 'spawn', 'fork']:
                            findings.append({
                                "level": "HIGH",
                                "category": "Process Spawn",
                                "message": f"OS process spawning call '{func_name}()' detected.",
                                "line": getattr(node, 'lineno', 1)
                            })
                            score -= 25

            except SyntaxError as e:
                findings.append({
                    "level": "HIGH",
                    "category": "Syntax Error",
                    "message": f"Python syntax error: {e.msg}",
                    "line": e.lineno or 1
                })
                score -= 50
            except Exception as e:
                logger.warning(f"AST parsing error during security check: {e}")

        else:
            # Regex-based guardrails for non-Python languages
            lower_code = code.lower()
            dangerous_patterns = [
                (r"\b(?:rm\s+-rf|shutil\.rmtree|os\.remove|os\.rmdir|os\.system|subprocess\.Popen)\b", "HIGH", "Filesystem/System", "Potential destructive filesystem or system call detected."),
                (r"\b(?:format\s+[c-z]:|mkfs|fdisk|dd\s+if=)\b", "CRITICAL", "Disk Formatting", "Dangerous disk formatting command detected."),
                (r"\b(?:eval\s*\(|exec\s*\(|child_process|fs\.rmdirSync|fs\.unlinkSync)\b", "HIGH", "Dynamic/Process", "Dynamic execution or Node.js filesystem manipulation detected."),
                (r"\b(?:system\s*\(|popen\s*\(|fork\s*\()\b", "HIGH", "C/C++ OS Call", "C/C++ OS system call or process forking detected.")
            ]
            
            for pattern, lvl, cat, msg in dangerous_patterns:
                if re.search(pattern, code, re.IGNORECASE):
                    findings.append({"level": lvl, "category": cat, "message": msg, "line": 1})
                    score -= 30 if lvl == "HIGH" else 50

        score = max(0, min(100, score))
        risk_level = "LOW" if score >= 85 else "MEDIUM" if score >= 65 else "HIGH" if score >= 40 else "CRITICAL"
        
        return {
            "risk_level": risk_level,
            "safety_score": score,
            "findings": findings,
            "summary": f"Security Profile: {risk_level} RISK (Score: {score}/100). {len(findings)} findings detected."
        }

    # ─── 2. Structured Error & Line-Number Parser ───

    def parse_error_details(self, stderr: str, compiler_output: str, language: str) -> Optional[Dict[str, Any]]:
        """
        Parses compiler errors and runtime tracebacks to extract exact line numbers,
        error types, and missing package recommendations for interactive UI jump-to-line.
        """
        combined = (stderr + "\n" + compiler_output).strip()
        if not combined:
            return None
            
        lang_key = language.lower()
        error_type = "RuntimeError"
        line_num = None
        message = combined.split('\n')[0][:150]
        recommendation = None

        if lang_key == "python":
            # Check for ModuleNotFoundError
            mod_match = re.search(r"ModuleNotFoundError:\s+No module named\s+['\"]([^'\"]+)['\"]", combined)
            if mod_match:
                pkg_name = mod_match.group(1)
                error_type = "ModuleNotFoundError"
                message = f"Missing Python package: '{pkg_name}'"
                recommendation = f"Package '{pkg_name}' is not installed in the active environment. Run 'pip install {pkg_name}' in your terminal to install it."
            
            # Extract line number from traceback (File "...", line X)
            line_matches = re.findall(r"File\s+['\"][^'\"]+['\"],\s+line\s+(\d+)", combined)
            if line_matches:
                line_num = int(line_matches[-1])  # Get last line number in stack trace (most relevant)
                
            # Extract exception type and message
            exc_match = re.search(r"^(\w+Error|\w+Exception):\s+(.+)$", combined, re.MULTILINE)
            if exc_match:
                error_type = exc_match.group(1)
                message = exc_match.group(2).strip()

        elif lang_key in ["javascript", "typescript"]:
            # Extract line number from Node.js error (at ... (:X:Y) or /path/main.js:X)
            line_match = re.search(r":(\d+):\d+", combined) or re.search(r"line\s+(\d+)", combined, re.IGNORECASE)
            if line_match:
                line_num = int(line_match.group(1))
            exc_match = re.search(r"^(\w+Error):\s+(.+)$", combined, re.MULTILINE)
            if exc_match:
                error_type = exc_match.group(1)
                message = exc_match.group(2).strip()

        elif lang_key in ["cpp", "c", "java", "rust"]:
            # g++ / javac / rustc line format: main.cpp:14:5: error: ...
            line_match = re.search(r"(?:main\.\w+|Main\.java):(\d+)(?::\d+)?:?\s+(?:error|warning|Exception):\s*(.+)", combined, re.IGNORECASE)
            if line_match:
                line_num = int(line_match.group(1))
                message = line_match.group(2).strip()
                error_type = "CompilationError" if "error" in combined.lower() else "RuntimeError"
            else:
                line_match = re.search(r":(\d+):", combined)
                if line_match:
                    line_num = int(line_match.group(1))

        if line_num or error_type != "RuntimeError" or recommendation:
            return {
                "error_type": error_type,
                "message": message,
                "line_number": line_num,
                "recommendation": recommendation
            }
        return None

    # ─── 3. Multi-Mode Code Execution Engine ───

    def execute_code(
        self, 
        code: str, 
        language: str, 
        stdin: str = "", 
        timeout: int = 5,
        mode: str = "standard",
        test_cases: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Executes code across 4 specialized modes:
        - 'standard': Fast compilation & execution with stdout/stderr capture.
        - 'audit': Static AST & vulnerability audit without executing code.
        - 'trace': Memory & step-profiling wrapper (measures peak RAM and CPU time).
        - 'test': Auto-grades code against an array of test cases (stdin -> expected_stdout).
        """
        lang_key = language.lower()
        if lang_key not in self.lang_config:
            return {
                "status": "unsupported",
                "stdout": "",
                "stderr": f"Language '{language}' is not supported by VoxCode Compiler Engine.",
                "exit_code": -1,
                "execution_time_ms": 0,
                "compiler_output": "",
                "language": language,
                "mode": mode
            }
            
        cfg = self.lang_config[lang_key]
        
        # 1. Perform Security Audit
        security_profile = self.analyze_security(code, lang_key)
        
        # If mode is 'audit', return static security report immediately without executing
        if mode == "audit":
            return {
                "status": "success",
                "stdout": f"=== VoxCode Extreme Security & AST Audit ===\n\n{security_profile['summary']}\n\nDetailed Findings:\n" + 
                          ("\n".join([f"  [{f['level']}] Line {f['line']} - {f['category']}: {f['message']}" for f in security_profile['findings']]) if security_profile['findings'] else "  No security vulnerabilities or risky system calls detected!"),
                "stderr": "",
                "exit_code": 0,
                "execution_time_ms": 0,
                "compiler_output": "",
                "language": language,
                "mode": "audit",
                "security_profile": security_profile
            }

        # Check compiler availability
        if not self._installed_compilers.get(lang_key, {}).get("available", False):
            self.probe_installed_compilers()
            if not self._installed_compilers.get(lang_key, {}).get("available", False):
                return {
                    "status": "error",
                    "stdout": "",
                    "stderr": f"Compiler/Interpreter for {cfg['name']} ({cfg['version_cmd'][0]}) is not installed in the OS PATH.",
                    "exit_code": -1,
                    "execution_time_ms": 0,
                    "compiler_output": "",
                    "language": language,
                    "mode": mode,
                    "security_profile": security_profile
                }

        # Create isolated job workspace
        job_id = f"job_{uuid.uuid4().hex[:8]}"
        job_dir = self.sandbox_dir / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        
        filename = "Main" + cfg["ext"] if lang_key == "java" else "main" + cfg["ext"]
        file_path = job_dir / filename
        
        if lang_key == "java" and "class Main" not in code:
            code = re.sub(r'public\s+class\s+\w+', 'public class Main', code, count=1)
            if "class Main" not in code:
                code = re.sub(r'class\s+\w+', 'class Main', code, count=1)
                
        # If mode is 'trace' for Python, inject memory profiling wrapper
        if mode == "trace" and lang_key == "python":
            wrapped_code = (
                "import tracemalloc, time, sys\n"
                "tracemalloc.start()\n"
                "_vc_t0 = time.perf_counter()\n"
                "# --- USER CODE START ---\n"
                + code + "\n"
                "# --- USER CODE END ---\n"
                "_vc_t1 = time.perf_counter()\n"
                "_vc_current, _vc_peak = tracemalloc.get_traced_memory()\n"
                "tracemalloc.stop()\n"
                "sys.stderr.write(f'\\n[VOXCODE_PROFILE] Peak RAM: {_vc_peak / (1024*1024):.3f} MB | CPU Time: {(_vc_t1 - _vc_t0)*1000:.2f} ms\\n')\n"
            )
            write_code = wrapped_code
        else:
            write_code = code

        try:
            file_path.write_text(write_code, encoding="utf-8")
        except Exception as e:
            shutil.rmtree(job_dir, ignore_errors=True)
            return {
                "status": "error",
                "stdout": "",
                "stderr": f"Failed to write source file in sandbox: {e}",
                "exit_code": -1,
                "execution_time_ms": 0,
                "compiler_output": "",
                "language": language,
                "mode": mode
            }

        compiler_output = ""
        start_time = time.perf_counter()
        
        try:
            # Step A: Compilation (if applicable)
            if cfg["compile"]:
                compile_cmd = [arg.format(file=str(file_path), dir=str(job_dir)) for arg in cfg["compile"]]
                logger.info(f"Compiling {lang_key}: {' '.join(compile_cmd)}")
                
                comp_res = subprocess.run(
                    compile_cmd,
                    cwd=str(job_dir),
                    capture_output=True,
                    text=True,
                    timeout=timeout + 5
                )
                
                compiler_output = (comp_res.stdout + "\n" + comp_res.stderr).strip()
                if comp_res.returncode != 0:
                    err_info = self.parse_error_details(comp_res.stderr, compiler_output, lang_key)
                    return {
                        "status": "compilation_error",
                        "stdout": "",
                        "stderr": compiler_output,
                        "exit_code": comp_res.returncode,
                        "execution_time_ms": round((time.perf_counter() - start_time) * 1000, 2),
                        "compiler_output": compiler_output,
                        "language": language,
                        "mode": mode,
                        "security_profile": security_profile,
                        "error_details": err_info
                    }

            # Step B: Execution
            run_cmd = [arg.format(file=str(file_path), dir=str(job_dir)) for arg in cfg["run"]]
            
            # If mode is 'test' and test_cases provided, run automated unit test benchmarking!
            if mode == "test" and test_cases and isinstance(test_cases, list):
                test_results = []
                passed_count = 0
                total_test_time = 0
                
                for idx, tc in enumerate(test_cases):
                    tc_stdin = tc.get("stdin", "")
                    expected_out = tc.get("expected_stdout", tc.get("expected", "")).strip()
                    
                    t_start = time.perf_counter()
                    tc_res = subprocess.run(
                        run_cmd,
                        cwd=str(job_dir),
                        input=tc_stdin,
                        capture_output=True,
                        text=True,
                        timeout=timeout
                    )
                    t_duration = round((time.perf_counter() - t_start) * 1000, 2)
                    total_test_time += t_duration
                    
                    actual_out = tc_res.stdout.strip()
                    is_pass = (actual_out == expected_out) and (tc_res.returncode == 0)
                    if is_pass:
                        passed_count += 1
                        
                    test_results.append({
                        "test_index": idx + 1,
                        "passed": is_pass,
                        "stdin": tc_stdin,
                        "expected_stdout": expected_out,
                        "actual_stdout": actual_out,
                        "stderr": tc_res.stderr.strip(),
                        "exit_code": tc_res.returncode,
                        "time_ms": t_duration
                    })
                
                summary_stdout = f"=== Unit Test Benchmarking Report ===\nPassed: {passed_count}/{len(test_cases)} test cases\nTotal Test Execution Time: {total_test_time:.2f} ms\n\n"
                for tr in test_results:
                    status_icon = "PASS" if tr["passed"] else "FAIL"
                    summary_stdout += f"Test #{tr['test_index']} [{status_icon}] ({tr['time_ms']} ms)\n  Input: {repr(tr['stdin'])}\n  Expected: {repr(tr['expected_stdout'])}\n  Actual:   {repr(tr['actual_stdout'])}\n"
                    if not tr["passed"] and tr["stderr"]:
                        summary_stdout += f"  Error: {tr['stderr']}\n"
                    summary_stdout += "\n"
                    
                return {
                    "status": "success" if passed_count == len(test_cases) else "test_failure",
                    "stdout": summary_stdout,
                    "stderr": "",
                    "exit_code": 0 if passed_count == len(test_cases) else 1,
                    "execution_time_ms": round(total_test_time, 2),
                    "compiler_output": compiler_output,
                    "language": language,
                    "mode": "test",
                    "security_profile": security_profile,
                    "test_report": {
                        "passed": passed_count,
                        "total": len(test_cases),
                        "pass_rate": round((passed_count / len(test_cases)) * 100, 1) if test_cases else 0,
                        "results": test_results
                    }
                }

            # Standard / Trace Single Execution
            logger.info(f"Executing {lang_key} ({mode}): {' '.join(run_cmd)}")
            exec_start = time.perf_counter()
            run_res = subprocess.run(
                run_cmd,
                cwd=str(job_dir),
                input=stdin,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            exec_duration_ms = round((time.perf_counter() - exec_start) * 1000, 2)
            
            stdout_val = run_res.stdout[:50000] if run_res.stdout else ""
            stderr_val = run_res.stderr[:50000] if run_res.stderr else ""
            if len(run_res.stdout) > 50000:
                stdout_val += "\n[...Output truncated at 50 KB...]"
                
            # Parse memory profile if present in stderr
            memory_mb = None
            prof_match = re.search(r"\[VOXCODE_PROFILE\] Peak RAM: ([0-9.]+) MB \| CPU Time: ([0-9.]+) ms", stderr_val)
            if prof_match:
                memory_mb = float(prof_match.group(1))
                # Remove profile header from stderr so it looks clean
                stderr_val = re.sub(r"\[VOXCODE_PROFILE\].*\n?", "", stderr_val).strip()

            status = "success" if run_res.returncode == 0 else "runtime_error"
            err_info = self.parse_error_details(stderr_val, compiler_output, lang_key) if status != "success" else None
            
            return {
                "status": status,
                "stdout": stdout_val,
                "stderr": stderr_val,
                "exit_code": run_res.returncode,
                "execution_time_ms": exec_duration_ms,
                "memory_peak_mb": memory_mb,
                "compiler_output": compiler_output,
                "language": language,
                "compiler_version": self._installed_compilers.get(lang_key, {}).get("version", ""),
                "mode": mode,
                "security_profile": security_profile,
                "error_details": err_info
            }

        except subprocess.TimeoutExpired:
            exec_duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return {
                "status": "timeout",
                "stdout": "",
                "stderr": f"Execution timed out after {timeout} seconds. Check for infinite loops or blocking input.",
                "exit_code": 124,
                "execution_time_ms": exec_duration_ms,
                "compiler_output": compiler_output,
                "language": language,
                "mode": mode,
                "security_profile": security_profile,
                "error_details": {"error_type": "TimeoutExpired", "message": f"Exceeded {timeout}s execution limit.", "line_number": None}
            }
        except Exception as e:
            logger.error(f"Execution failed: {e}")
            return {
                "status": "error",
                "stdout": "",
                "stderr": f"Internal compiler service error: {e}",
                "exit_code": -1,
                "execution_time_ms": round((time.perf_counter() - start_time) * 1000, 2),
                "compiler_output": compiler_output,
                "language": language,
                "mode": mode,
                "security_profile": security_profile
            }
        finally:
            try:
                shutil.rmtree(job_dir, ignore_errors=True)
            except Exception as e:
                logger.warning(f"Failed to remove sandbox dir {job_dir}: {e}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    cs = CompilerService()
    
    print("\n[Testing v2.0 AST Security Audit]")
    risky_code = "import os\nwhile True:\n    pass\neval('os.system(\"dir\")')"
    sec_res = cs.analyze_security(risky_code, "python")
    print(f"  Risk Level: {sec_res['risk_level']} | Score: {sec_res['safety_score']}/100")
    for f in sec_res['findings']:
        print(f"    -> [{f['level']}] Line {f['line']}: {f['message']}")
        
    print("\n[Testing v2.0 Trace & Memory Profiling Mode]")
    py_code = "data = [x**2 for x in range(100000)]\nprint(f'Calculated {len(data)} items')"
    res = cs.execute_code(py_code, "python", mode="trace")
    print(f"  Status: {res['status']} | Time: {res['execution_time_ms']} ms | Peak RAM: {res.get('memory_peak_mb')} MB")
    print(f"  Stdout: {res['stdout'].strip()}")
    
    print("\n[Testing v2.0 Unit Test Benchmarking Mode]")
    test_code = "import sys\nfor line in sys.stdin:\n    num = int(line.strip())\n    print(num * num)"
    tcases = [
        {"stdin": "5\n", "expected_stdout": "25"},
        {"stdin": "10\n", "expected_stdout": "100"},
        {"stdin": "-4\n", "expected_stdout": "16"}
    ]
    test_res = cs.execute_code(test_code, "python", mode="test", test_cases=tcases)
    print(f"  Test Status: {test_res['status']} | Pass Rate: {test_res['test_report']['pass_rate']}%")
    print(test_res['stdout'])

compiler_service = CompilerService()
