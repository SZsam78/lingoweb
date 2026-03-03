import React from 'react';

export const getDriveIframeUrl = (url?: string) => {
    if (!url) return null;
    try {
        if (url.includes('drive.google.com/file/d/')) {
            const match = url.match(/\/d\/(.*?)\//);
            if (match && match[1]) {
                // Return the embedded preview player format
                return `https://drive.google.com/file/d/${match[1]}/preview`;
            }
        }
        return url;
    } catch {
        return url;
    }
};

export const AudioPlayer = ({ url }: { url: string }) => {
    const iframeUrl = getDriveIframeUrl(url);
    if (!iframeUrl) return null;
    return (
        <div className="my-4 mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
            {iframeUrl.includes('drive.google.com') ? (
                <iframe
                    src={iframeUrl}
                    className="w-full h-16 border-none outline-none"
                    allow="autoplay"
                />
            ) : (
                <audio controls src={iframeUrl} className="w-full h-12 outline-none" controlsList="nodownload" />
            )}
        </div>
    );
};
