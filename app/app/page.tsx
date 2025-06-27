"use client";
import { useState, useMemo } from "react";
import Image from "next/image";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  audioFormats: Array<{
    itag: number;
    quality: string;
    bitrate: number;
    container: string;
    contentLength: string;
  }>;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setStatus("유튜브 주소를 입력하세요.");
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setStatus("유효한 유튜브 URL이 아닙니다.");
      return;
    }

    setLoading(true);
    setStatus("동영상 정보를 가져오는 중...");
    setVideoInfo(null);

    try {
      // 외부 API를 사용하여 동영상 정보 가져오기
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      
      if (!response.ok) {
        throw new Error('동영상 정보를 가져올 수 없습니다.');
      }

      const oembedData = await response.json();
      
      // 기본 동영상 정보 구성
      const mockVideoInfo: VideoInfo = {
        title: oembedData.title,
        thumbnail: oembedData.thumbnail_url,
        duration: "0", // oembed에서는 길이 정보를 제공하지 않음
        author: oembedData.author_name,
        audioFormats: [
          {
            itag: 140,
            quality: "AAC 128kbps",
            bitrate: 128,
            container: "m4a",
            contentLength: "0"
          },
          {
            itag: 251,
            quality: "Opus 160kbps",
            bitrate: 160,
            container: "webm",
            contentLength: "0"
          }
        ]
      };

      setVideoInfo(mockVideoInfo);
      setStatus("동영상 정보를 성공적으로 가져왔습니다. 다운로드 링크를 생성합니다.");
      
      // 기본적으로 첫 번째 오디오 포맷 선택
      if (mockVideoInfo.audioFormats.length > 0) {
        setSelectedQuality(mockVideoInfo.audioFormats[0].itag);
      }

    } catch (error) {
      setStatus("동영상 정보를 가져오는데 실패했습니다. URL을 확인해주세요.");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedQuality || !videoInfo) {
      setStatus("오디오 품질을 선택해주세요.");
      return;
    }

    setDownloading(true);
    setStatus("다운로드 링크를 생성하는 중...");

    try {
      // 외부 다운로드 서비스 사용
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('비디오 ID를 추출할 수 없습니다.');
      }

      // 다양한 다운로드 서비스 제공
      const y2mateUrl = `https://www.y2mate.com/youtube/${videoId}`;
      const ytmp3Url = `https://ytmp3.nu/${videoId}/`;
      const ytmp3ccUrl = "https://ytmp3.cc/";
      const x2convertUrl = `https://x2convert.com/en16/download-youtube-mp3/${videoId}`;
      const youtubemp3freeUrl = `https://youtubemp3free.com/youtube/${videoId}`;
      setStatus("y2mate는 입력한 주소로 바로 변환이 가능합니다.\n나머지 사이트는 새 창에서 유튜브 주소를 한 번 더 입력해야 합니다. (사이트별로 광고/팝업이 있을 수 있습니다. 변환이 안 될 경우 다른 사이트를 이용해 주세요.)");

    } catch (error) {
      setStatus("다운로드 링크 생성에 실패했습니다.");
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDuration = (seconds: string) => {
    const totalSeconds = parseInt(seconds);
    if (totalSeconds === 0) return "길이 미정";
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return "크기 미정";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const videoId = useMemo(() => extractVideoId(url), [url]);
  const y2mateUrl = useMemo(() => videoId ? `https://www.y2mate.com/youtube/${videoId}` : "", [videoId]);
  const ytmp3Url = "https://ytmp3.nu/";
  const ytmp3ccUrl = "https://ytmp3.cc/";
  const x2convertUrl = "https://x2convert.com/en16/";
  const youtubemp3freeUrl = "https://youtubemp3free.com/";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-white dark:bg-gray-900 transition-colors">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">유튜브 MP3 변환기</h1>
      
      <div className="text-center mb-4 text-gray-700 dark:text-gray-300 max-w-md">
        <p>유튜브 동영상을 MP3로 변환하여 다운로드할 수 있습니다.</p>
        <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">※ 외부 다운로드 서비스를 통해 처리됩니다.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="text"
          placeholder="유튜브 동영상 주소를 입력하세요"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 placeholder-gray-400 dark:placeholder-gray-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white rounded px-4 py-2 font-semibold hover:bg-blue-600 dark:hover:bg-blue-400 transition disabled:bg-gray-400 dark:disabled:bg-gray-700"
        >
          {loading ? "처리 중..." : "동영상 정보 가져오기"}
        </button>
      </form>

      {status && (
        <div className={`mt-4 p-3 rounded font-semibold ${
          status.includes('성공') || status.includes('완료') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
          status.includes('오류') || status.includes('실패') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          {status}
        </div>
      )}

      {videoInfo && (
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 mb-4">
            {videoInfo.thumbnail && (
              <Image
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                width={120}
                height={90}
                className="rounded"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{videoInfo.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-1">채널: {videoInfo.author}</p>
              <p className="text-gray-700 dark:text-gray-300">길이: {formatDuration(videoInfo.duration)}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">다운로드 옵션</h3>
            <div className="grid gap-2">
              {videoInfo.audioFormats.map((format) => (
                <label key={format.itag} className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <input
                    type="radio"
                    name="quality"
                    value={format.itag}
                    checked={selectedQuality === format.itag}
                    onChange={() => setSelectedQuality(format.itag)}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {format.quality}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {format.container.toUpperCase()} • {formatFileSize(format.contentLength)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => window.open(y2mateUrl, '_blank')} className="bg-green-500 text-white rounded px-4 py-2 font-semibold hover:bg-green-600 dark:hover:bg-green-400 transition">
              y2mate (추천, 바로 변환)
            </button>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 mb-2 text-center font-semibold">
              y2mate에서 변환이 제대로 안된다면 다른 사이트를 이용해 보세요.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => window.open(ytmp3Url, '_blank')} className="bg-blue-500 text-white rounded px-4 py-2 font-semibold hover:bg-blue-600 dark:hover:bg-blue-400 transition">
                ytmp3
              </button>
              <button onClick={() => window.open(ytmp3ccUrl, '_blank')} className="bg-indigo-500 text-white rounded px-4 py-2 font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-400 transition">
                ytmp3.cc
              </button>
              <button onClick={() => window.open(x2convertUrl, '_blank')} className="bg-pink-500 text-white rounded px-4 py-2 font-semibold hover:bg-pink-600 dark:hover:bg-pink-400 transition">
                x2convert
              </button>
              <button onClick={() => window.open(youtubemp3freeUrl, '_blank')} className="bg-yellow-500 text-gray-900 rounded px-4 py-2 font-semibold hover:bg-yellow-400 dark:hover:bg-yellow-300 transition">
                youtubemp3free
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
