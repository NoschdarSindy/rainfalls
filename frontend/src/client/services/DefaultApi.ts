/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultApi {

    /**
     * Hello World
     * @returns any Successful Response
     * @throws ApiError
     */
    public static helloWorldGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }

    /**
     * Detail
     * @returns any Successful Response
     * @throws ApiError
     */
    public static detailDetailIdGet({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/detail/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Query
     * Query the Database on the Fulltext Search index and return the specified fields
     * of all matching documents. Optionally limit the results.
     *
     *
     * Example URL:
     * /query?length__lte=1&severity_index__gt=0&fields=area&fields=length&limit=200
     *
     * Will parse to:
     * filters = [[length, lte, 1], [severity_index, gt, 0]]
     * fields  = [area, length]
     * limit   = 200
     * @returns any Successful Response
     * @throws ApiError
     */
    public static queryQueryGet({
        filterParams = '',
        fields,
        limit = 999999,
    }: {
        filterParams?: string,
        fields?: Array<string>,
        limit?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/query',
            query: {
                'filter_params': filterParams,
                'fields': fields,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Overview
     * @returns any Successful Response
     * @throws ApiError
     */
    public static overviewOverviewFieldGet({
        field,
        start = '1970-01-01',
        end = '2018-01-01',
        bins = 20,
    }: {
        field: string,
        start?: string,
        end?: string,
        bins?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/overview/{field}/',
            path: {
                'field': field,
            },
            query: {
                'start': start,
                'end': end,
                'bins': bins,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Overview
     * @returns any Successful Response
     * @throws ApiError
     */
    public static overviewOverviewFieldBinsGet({
        field,
        bins,
        start = '1970-01-01',
        end = '2018-01-01',
    }: {
        field: string,
        bins: number,
        start?: string,
        end?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/overview/{field}/{bins}',
            path: {
                'field': field,
                'bins': bins,
            },
            query: {
                'start': start,
                'end': end,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Overview
     * @returns any Successful Response
     * @throws ApiError
     */
    public static overviewOverviewFieldStartEndGet({
        field,
        start,
        end,
        bins = 20,
    }: {
        field: string,
        start: string,
        end: string,
        bins?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/overview/{field}/{start}/{end}/',
            path: {
                'field': field,
                'start': start,
                'end': end,
            },
            query: {
                'bins': bins,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Overview
     * @returns any Successful Response
     * @throws ApiError
     */
    public static overviewOverviewFieldStartEndBinsGet({
        field,
        start,
        end,
        bins,
    }: {
        field: string,
        start: string,
        end: string,
        bins: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/overview/{field}/{start}/{end}/{bins}',
            path: {
                'field': field,
                'start': start,
                'end': end,
                'bins': bins,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}