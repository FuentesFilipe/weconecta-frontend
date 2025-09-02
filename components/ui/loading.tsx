import CircularProgress from '@mui/material/CircularProgress';

export function Loading({ className }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center h-full ${className}`}>
            <svg width={0} height={0}>
                <defs>
                    <linearGradient id="progress_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e8433b" />
                        <stop offset="100%" stopColor="#fcb043" />
                    </linearGradient>
                </defs>
            </svg>
            <CircularProgress sx={{ 'svg circle': { stroke: 'url(#progress_gradient)' } }} />
        </div>
    );
}