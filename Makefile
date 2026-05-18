.PHONY: install test demo proxy-demo xrpl-demo did-demo legacy-did-demo docker-build docker-demo clean

install:
	python -m pip install -r requirements.txt

test:
	pytest

demo:
	python examples/demo.py

proxy-demo:
	python examples/proxy_demo.py

xrpl-demo:
	python examples/xrpl_anchor_demo.py

did-demo:
	python examples/did_demo.py

legacy-did-demo:
	python examples/legacy_did_agentguard_demo.py

docker-build:
	docker compose build

docker-demo:
	docker compose run --rm agentguard

clean:
	find . -type d -name "__pycache__" -prune -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -prune -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete


xrpl-did-demo:
	python examples/xrpl_did_demo.py
\n\nxrpl-didset-demo:\n\tpython examples/xrpl_didset_demo.py\n\n\nxrpl-live-anchor-demo:\n\tpython examples/xrpl_live_anchor_demo.py\n\n\nstripe-proxy-demo:\n\tpython examples/stripe_proxy_demo.py\n