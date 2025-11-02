# app.py — Backend FastAPI monolithique pour gopu.gp
# Contient: transpileur RA -> Python, runtime sandbox, registry local, et API complète.

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Tuple, Dict, Optional
from pathlib import Path
import os
import json
import re
import io
import sys
from dataclasses import dataclass
from contextlib import redirect_stdout, redirect_stderr

# -------------------------------
# Config de l'application / CORS
# -------------------------------

APP_NAME = "gopu.gp-api"
APP_VERSION = os.getenv("GOPU_API_VERSION", "0.1.0")
CORS_ALLOW = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")

app = FastAPI(title=APP_NAME, version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Transpileur RA -> Python
# -------------------------------

@dataclass
class TranspileResult:
    python_code: str
    mapping: List[Tuple[int, int]]
    macros: Dict[str, Tuple[List[str], str]]

MACRO_DEF_RE = re.compile(r'^\s*macro:\s*(\w+)`\((.*?)\)`\s*=>\s*(.+)$')
TYPE_ASSIGN_RE = re.compile(r'^\s*tehet\s+(\w+)\s*:\s*([\w\[\], ]+)\s*=\s*(.+)$')
ASSIGN_RE = re.compile(r'^\s*tehet\s+(\w+)\s*=\s*(.+)$')

def parse_macros(lines: List[str]):
    macros: Dict[str, Tuple[List[str], str]] = {}
    keep: List[str] = []
    for line in lines:
        m = MACRO_DEF_RE.match(line)
        if m:
            name, args, body = m.groups()
            arglist = [a.strip() for a in args.split(',')] if args.strip() else []
            macros[name] = (arglist, body)
        else:
            keep.append(line)
    return macros, keep

def expand_macros(line: str, macros: Dict[str, Tuple[List[str], str]]):
    for name, (args, body) in macros.items():
        pattern = re.compile(rf'\bmacro\s+{name}`\((.*?)\)`|\binvoke ritual {name}`\((.*?)\)`')
        def repl(match):
            params = match.group(1) or match.group(2) or ''
            vals = [v.strip() for v in params.split(',')] if params else []
            replaced = body
            for i, a in enumerate(args):
                v = vals[i] if i < len(vals) else ''
                replaced = replaced.replace(a, v)
            return replaced
        line = pattern.sub(repl, line)
    return line

def transpile_ra_to_python(ra_code: str) -> TranspileResult:
    lines = ra_code.splitlines()
    macros, lines = parse_macros(lines)

    mapping: List[Tuple[int, int]] = []
    py_lines: List[str] = []

    for i, raw in enumerate(lines, start=1):
        line = expand_macros(raw, macros)

        # Imports RA: gop .. up module [as alias]
        line = re.sub(
            r'\bgop\s*\.\.\s*up\s+([\w\.]+)(?:\s+as\s+(\w+))?\b',
            lambda m: f"import {m.group(1)} as {m.group(2)}" if m.group(2) else f"import {m.group(1)}",
            line
        )

        # I/O et contrôle
        line = re.sub(r'^\s*say:\s*(.+)$', r'print(\1)', line)
        line = re.sub(r'^\s*if soul is:\s*(.+)$', r'if \1:', line)
        line = re.sub(r'^\s*loop until:\s*(.+)$', r'while \1:', line)

        # Fonctions et retours
        line = re.sub(r'^\s*ritual:\s*(\w+)`\((.*?)\)`\s*$', r'def \1(\2):', line)
        line = re.sub(r'^\s*ritual:\s*async\s+(\w+)`\((.*?)\)`\s*$', r'async def \1(\2):', line)
        line = re.sub(r'^\s*invoke ritual\s+(\w+)`\((.*?)\)`\s*$', r'\1(\2)', line)
        line = re.sub(r'^\s*bless:\s*(.+)$', r'return \1', line)

        # Contexte et erreurs
        line = re.sub(r'^\s*with sigil:\s*(.+)$', r'with \1:', line)
        line = re.sub(r'^\s*sigil:\s*(\w+)\s*$', r'# sigil: \1', line)
        line = re.sub(r'^\s*guard:\s*try\s*$', r'try:', line)
        line = re.sub(r'^\s*guard:\s*catch\s+(\w+)\s*as\s*(\w+)\s*$', r'except \1 as \2:', line)
        line = re.sub(r'^\s*guard:\s*finally\s*$', r'finally:', line)

        # Async
        line = re.sub(r'^\s*await soul:\s*(.+)$', r'await \1', line)

        # Typage
        sb = re.match(r'^\s*soulbind:\s*(\w+)\s*->\s*([\w\[\], ]+)\s*$', line)
        if sb:
            name, typ = sb.groups()
            line = f"{name}: {typ}"

        # Assignations
        m = TYPE_ASSIGN_RE.match(line)
        if m:
            n, t, v = m.groups()
            line = f"{n}: {t} = {v}"
        else:
            m2 = ASSIGN_RE.match(line)
            if m2:
                n, v = m2.groups()
                line = f"{n} = {v}"
            else:
                line = line.replace('tehet ', '')

        # Ignorer directives sandbox au transpile
        if line.strip().startswith('sandbox allow:'):
            continue

        py_lines.append(line)
        mapping.append((i, len(py_lines)))

    return TranspileResult('\n'.join(py_lines), mapping, macros)

# -------------------------------
# Runtime d'exécution Python
# -------------------------------

import builtins

def run_python(code: str, sandbox: bool = False, whitelist: Optional[List[str]] = None, argv: Optional[List[str]] = None):
    env: Dict[str, object] = {}
    if sandbox:
        allowed = set(whitelist or ['print', 'range'])
        safe_builtins = {k: getattr(builtins, k) for k in allowed if hasattr(builtins, k)}
        env['__builtins__'] = safe_builtins
    else:
        env['__builtins__'] = builtins
    env['__name__'] = '__main__'
    env['__args__'] = argv or []
    env['__return__'] = None  # point d'extension: valeur de retour globale
    exec(code, env, env)
    return env

def execute_with_capture(code: str, sandbox: bool = False, allow: Optional[List[str]] = None):
    stdout = io.StringIO()
    stderr = io.StringIO()
    returned = None
    try:
        with redirect_stdout(stdout), redirect_stderr(stderr):
            env = run_python(code, sandbox=sandbox, whitelist=allow or ['print', 'range'])
            returned = env.get("__return__", None)
    except Exception as e:
        print(f"Execution error: {e}", file=stderr)
    return stdout.getvalue(), stderr.getvalue(), returned

# -------------------------------
# Registry local (publish/install)
# -------------------------------

REG_DIR = Path(os.getenv("GOPU_REGISTRY_DIR", str(Path.home() / ".gln" / "registry")))
REG_DIR.mkdir(parents=True, exist_ok=True)
REG_FILE = REG_DIR / "packages.json"

def load_registry() -> Dict[str, Dict[str, object]]:
    if REG_FILE.exists():
        try:
            return json.loads(REG_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def save_registry(reg: Dict[str, Dict[str, object]]):
    REG_FILE.write_text(json.dumps(reg, ensure_ascii=False, indent=2), encoding="utf-8")

# -------------------------------
# Schémas Pydantic (API)
# -------------------------------

class CodeIn(BaseModel):
    source: str = Field(..., description="Code RA à transpiler/exécuter")
    sandbox: bool = Field(False, description="Activer l'exécution sandboxée")
    allow: Optional[List[str]] = Field(None, description="Whitelist des builtins en sandbox")

class TranspileOut(BaseModel):
    python: str
    mapping: List[List[int]]  # [[ra_line, py_line], ...]

class RunOut(BaseModel):
    stdout: str
    stderr: str
    returned: Optional[str] = None

class ExplainOut(BaseModel):
    python: str
    mapping: List[List[int]]
    macros: Dict[str, List[str]]  # nom -> args

class BuildIn(BaseModel):
    source: str
    filename: Optional[str] = "out.py"

class HealthOut(BaseModel):
    name: str
    version: str
    status: str

class PublishIn(BaseModel):
    name: str = Field(..., min_length=1)
    version: str = Field(..., min_length=1)
    source: str = Field(..., description="Code RA du module")
    metadata: Optional[Dict[str, object]] = Field(default_factory=dict)

class PublishOut(BaseModel):
    ok: bool
    name: str
    version: str

class PackageInfo(BaseModel):
    name: str
    version: str
    metadata: Dict[str, object]

# -------------------------------
# Routes de l'API
# -------------------------------

@app.get("/health", response_model=HealthOut)
def health():
    return HealthOut(name=APP_NAME, version=APP_VERSION, status="ok")

@app.get("/version")
def version():
    return {"version": APP_VERSION}

@app.get("/")
def root():
    return {"message": "Gopu.gp API — RA transpile/run/publish", "docs": "/docs"}

@app.post("/transpile", response_model=TranspileOut)
def api_transpile(code: CodeIn):
    try:
        res: TranspileResult = transpile_ra_to_python(code.source)
        mapping = [[a, b] for (a, b) in res.mapping]
        return TranspileOut(python=res.python_code, mapping=mapping)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur transpilation: {e}")

@app.post("/explain", response_model=ExplainOut)
def api_explain(code: CodeIn):
    try:
        res: TranspileResult = transpile_ra_to_python(code.source)
        mapping = [[a, b] for (a, b) in res.mapping]
        macros = {k: v[0] for k, v in res.macros.items()}
        return ExplainOut(python=res.python_code, mapping=mapping, macros=macros)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur explain: {e}")

@app.post("/run", response_model=RunOut)
def api_run(code: CodeIn):
    try:
        res: TranspileResult = transpile_ra_to_python(code.source)
        out, err, ret = execute_with_capture(res.python_code, sandbox=code.sandbox, allow=code.allow)
        return RunOut(stdout=out, stderr=err, returned=ret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur exécution: {e}")

@app.post("/build")
def api_build(payload: BuildIn):
    try:
        res: TranspileResult = transpile_ra_to_python(payload.source)
        fname = payload.filename or "out.py"
        Path(fname).write_text(res.python_code, encoding="utf-8")
        return {"ok": True, "file": fname, "bytes": len(res.python_code.encode("utf-8"))}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur build: {e}")

# ---------- PUBLISH / REGISTRY ----------

@app.post("/publish", response_model=PublishOut)
def api_publish(pkg: PublishIn):
    """
    Publie un module RA dans le registre local (~/.gln/registry/packages.json).
    Stocke code source RA, Python généré, et métadonnées.
    """
    try:
        # Transpiler pour stocker aussi la version Python générée
        res = transpile_ra_to_python(pkg.source)
        registry = load_registry()
        if pkg.name not in registry:
            registry[pkg.name] = {}
        registry[pkg.name][pkg.version] = {
            "source": pkg.source,
            "python": res.python_code,
            "metadata": pkg.metadata or {},
        }
        save_registry(registry)
        return PublishOut(ok=True, name=pkg.name, version=pkg.version)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur publish: {e}")

@app.get("/packages")
def api_packages():
    """Liste des paquets disponibles dans le registre local."""
    reg = load_registry()
    summary = {name: sorted(vers.keys()) for name, vers in reg.items()}
    return {"packages": summary}

@app.get("/package/{name}/{version}", response_model=PackageInfo)
def api_package_get(name: str, version: str):
    """Récupère un paquet spécifique (code RA/Python + metadata)."""
    reg = load_registry()
    pkg = reg.get(name, {}).get(version)
    if not pkg:
        raise HTTPException(status_code=404, detail="Paquet introuvable")
    return PackageInfo(name=name, version=version, metadata=pkg.get("metadata", {}))

@app.get("/package/{name}/{version}/source")
def api_package_source(name: str, version: str):
    """Renvoie le code source RA du paquet."""
    reg = load_registry()
    pkg = reg.get(name, {}).get(version)
    if not pkg:
        raise HTTPException(status_code=404, detail="Paquet introuvable")
    return {"name": name, "version": version, "source": pkg.get("source", "")}

@app.get("/package/{name}/{version}/python")
def api_package_python(name: str, version: str):
    """Renvoie le code Python généré du paquet."""
    reg = load_registry()
    pkg = reg.get(name, {}).get(version)
    if not pkg:
        raise HTTPException(status_code=404, detail="Paquet introuvable")
    return {"name": name, "version": version, "python": pkg.get("python", "")}
