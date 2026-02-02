import { 
  Monitor, Download, Connection, Refresh, Link, EditPen 
} from '@element-plus/icons-vue';

export const getStepStyle = (type: string) => {
    switch (type) {
        case 'shell': return { icon: Monitor, color: '#374151', bg: '#f3f4f6' };
        case 'download_url': return { icon: Download, color: '#2563eb', bg: '#eff6ff' };
        case 'download_cloud': return { icon: Download, color: '#0891b2', bg: '#ecfeff' };
        case 'change_os': return { icon: Refresh, color: '#ea580c', bg: '#fff7ed' };
        case 'http_request': return { icon: Link, color: '#16a34a', bg: '#f0fdf4' };
        case 'custom_js': return { icon: EditPen, color: '#9333ea', bg: '#faf5ff' };
        default: return { icon: Connection, color: '#6b7280', bg: '#f9fafb' };
    }
};

export const getTaskColor = (id: string) => {
    const colors = ['#007aff', '#34c759', '#5856d6', '#ff9500', '#ff2d55', '#af52de', '#ff3b30', '#5ac8fa', '#ffcc00'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const formatStepType = (type: string, t: (key: string) => string) => {
    const map: Record<string, string> = {
        shell: t('rpa.actions.shellScript'),
        download_url: t('rpa.actions.downloadUrl'),
        download_cloud: t('rpa.actions.downloadCloud'),
        change_os: t('rpa.actions.changeOs'),
        http_request: t('rpa.actions.httpRequest'),
        custom_js: t('rpa.actions.customJs')
    };
    return map[type] || type;
};
