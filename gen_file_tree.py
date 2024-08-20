import os
from pathlib import Path
import json

ASSETS = Path(__file__).parent / "static"
LIBRARY = Path(__file__).parent / "src" / "lib"


def gen_webm(path: Path, indx: int):
    ret = os.system(
        f'ffmpeg -i {path.as_posix()} -y -vf "select=eq(n\,0),scale=\'min(1920,iw)\':\'min(1080,ih)\'" -q:v 80 -frames:v 1 {(ASSETS / "video" / "preview" / f"preview{indx}.webp").as_posix()}'
    )
    if ret != 0:
        raise RuntimeError("Failed to generate preview")
    ret = os.system(
        f'ffmpeg -i {path.as_posix()} -y -an -t 30 -vf "scale=\'min(1920,iw)\':\'min(1080,ih)\'" -c:v libvpx-vp9 -threads 8  {(ASSETS / 'video' / f'rain{indx}.webm').as_posix()}'
    )
    if ret != 0:
        raise RuntimeError("Failed to generate webm")
    os.remove(path.as_posix())


def main():
    audio = [a for a in (ASSETS / "audio").iterdir()]
    video = [v for v in (ASSETS / "video").iterdir()]

    retJson = {
        "audio": [],
        "video": [],
    }

    for a in audio:
        if ".mp3" in a.suffix:
            print(f"find audio {a.as_posix()}")
            retJson["audio"].append(a.relative_to(ASSETS).as_posix())

    last_index = max([int(v.stem[4:]) for v in video if "rain" in v.stem], default=0)
    for v in video:
        match v.suffix:
            case ".webm":
                print(f"find video {v.as_posix()}")
                retJson["video"].append(
                    {
                        "media": v.relative_to(ASSETS).as_posix(),
                        "preview": (
                            (
                                ASSETS / "video" / "preview" / f"{v.stem}.webp"
                            ).relative_to(ASSETS)
                        ).as_posix(),
                    }
                )
            case ".mp4":
                last_index += 1
                gen_webm(v, last_index)

    with open(LIBRARY / "media.json", "w") as f:
        json.dump(retJson, f)


if __name__ == "__main__":
    main()
