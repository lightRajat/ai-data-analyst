# -------------------------------------------------------------------------
# Stage 1: Builder (Compiles the environment)
# -------------------------------------------------------------------------
FROM python:3.12-slim AS builder

# 1. Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# 2. Install dependencies
# We use cached mounts so subsequent builds are instant
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./

# Verify lockfile exists and sync dependencies into .venv
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# -------------------------------------------------------------------------
# Stage 2: Runtime (The actual application)
# -------------------------------------------------------------------------
FROM python:3.12-slim

# 1. Install System Dependencies (REQUIRED for OpenCV & PDF tools)
# 'slim' images lack these libraries, causing "ImportError: libGL.so.1"
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 2. Setup User (Matches your original configuration)
RUN useradd -m -u 1000 user
USER user
WORKDIR /app

# 3. Copy the Virtual Environment from the Builder stage
# We explicitly set ownership to 'user' so it can read/execute packages
COPY --from=builder --chown=user:user /app/.venv /app/.venv

# 4. Activate the environment
# Setting PATH ensures 'python' and 'uvicorn' automatically use the .venv version
ENV PATH="/app/.venv/bin:$PATH"

# 5. Copy Application Code
COPY --chown=user . /app

# 6. Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]