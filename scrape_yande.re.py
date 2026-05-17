"""Download yande.re images and LoRA-ready caption files by artist tag.

Outputs are written to ./dataset so they stay inside the app's dataset scope.
Each downloaded image gets a sibling .txt file with comma-separated tags.
"""

import requests
import time
import os
import json
import re
from urllib.parse import urlparse

# yande.re 的画师检索直接使用 tag 名，不使用 Danbooru 风格的 artist: 前缀。
ARTIST_TAG = "mignon"
BASE_URL = "https://yande.re"
SAVE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset")
os.makedirs(SAVE_DIR, exist_ok=True)

# yande.re API 对默认客户端较敏感，保留明确 User-Agent 便于服务端识别请求来源。
HEADERS = {"User-Agent": "YandeRe-API-Crawler (litardphobia@gmail.com)"}

def clean_filename(name: str) -> str:
    """清洗文件名：只保留字母数字和下划线"""
    name = re.sub(r'[^\w]', '_', str(name))
    name = re.sub(r'_+', '_', name).strip('_')
    return name[:64]  # 截断过长文件名

# 汇总元数据便于后续排查来源、补下载或重建 caption。
metadata = {}
page = 1
total = 0

# 打印爬取方案
print(f"开始爬取 yande.re aritst/{ARTIST_TAG}...")

while True:
    # API 每页最多请求 100 条；空页表示该 tag 已无更多结果。
    api_url = f"{BASE_URL}/post.json?tags={ARTIST_TAG}&limit=100&page={page}"
    print(f"\n[页 {page}] 请求: {api_url}")

    try:
        resp = requests.get(api_url, headers=HEADERS, timeout=30)
    except Exception as e:
        print(f"请求异常: {e}")
        break

    if resp.status_code != 200:
        print(f"请求失败: HTTP {resp.status_code}")
        break

    posts = resp.json()
    if not posts:
        print("无更多数据，爬取完毕。")
        break

    print(f"  本页获取到 {len(posts)} 个 post")

    for post in posts:
        post_id = post.get("id")
        tags = post.get("tags", "")
        file_url = post.get("file_url", "")

        if not file_url:
            print(f"  [{post_id}] 无 file_url，跳过")
            continue

        ext = os.path.splitext(urlparse(file_url).path)[1] or ".jpg"
        clean_name = clean_filename(post_id)
        img_path = os.path.join(SAVE_DIR, f"{clean_name}{ext}")
        tags_path = os.path.join(SAVE_DIR, f"{clean_name}.txt")

        # 断点续传：图片和 caption 都存在时跳过，避免重复下载覆盖人工修订的标签。
        if os.path.exists(img_path) and os.path.exists(tags_path):
            print(f"  [{post_id}] 已存在，跳过")
            metadata[str(post_id)] = {
                "tags": tags.split(),
                "file_url": file_url,
                "local_path": img_path
            }
            total += 1
            continue

        # 下载图片
        try:
            img_resp = requests.get(file_url, headers=HEADERS, timeout=60, stream=True)
        except Exception as e:
            print(f"  [{post_id}] 下载异常: {e}")
            continue

        if img_resp.status_code == 200:
            with open(img_path, "wb") as f:
                for chunk in img_resp.iter_content(chunk_size=8192):
                    f.write(chunk)

            # 保存标签（逗号分隔，兼容 LoRA 训练集格式）
            tag_list = tags.split()
            with open(tags_path, "w", encoding="utf-8") as f:
                f.write(", ".join(tag_list))

            metadata[str(post_id)] = {
                "tags": tag_list,
                "file_url": file_url,
                "local_path": img_path
            }
            total += 1
            print(f"  [{post_id}] 已下载 | 文件名: {clean_name}{ext} | 标签数: {len(tag_list)}")
        else:
            print(f"  [{post_id}] 图片下载失败: HTTP {img_resp.status_code}")

        time.sleep(0.5)  # 图片级限速，降低对源站压力。

    page += 1
    time.sleep(1)  # 页级限速，避免连续 API 请求过快。

# 保存汇总元数据
meta_path = os.path.join(SAVE_DIR, "metadata.json")
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)

print(f"\n爬取完成！共处理 {total} 张图片，保存至: {SAVE_DIR}")
print(f"元数据保存至: {meta_path}")
