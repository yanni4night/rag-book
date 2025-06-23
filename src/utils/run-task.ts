import yoctoSpinner from 'yocto-spinner';
import { prettyDuration } from './format.ts';

export function runTask<T = unknown>(title: string, fn: () => Promise<T> | T, options?: {
    spinner?: boolean
}): Promise<T> {
    const loadingSpinner = yoctoSpinner({ text: '' });
    const useSpinner = options?.spinner ?? true;
    const startTime = Date.now();

    return Promise.resolve().then(() => {
        const text = `${title}...`;
        useSpinner ? loadingSpinner.start(text) : console.log(text);
    }).then(() => Promise.resolve(fn())).then((ret) => {
        const text = `${title}成功：${prettyDuration(Date.now() - startTime)}`;
        useSpinner ? loadingSpinner.success(text) : loadingSpinner.info(text);
        return ret;
    }).catch(err => {
        const text = `${title}失败：${prettyDuration(Date.now() - startTime)}`;
        useSpinner ? loadingSpinner.error(text) : loadingSpinner.info(text);
        return Promise.reject(err);
    });
}