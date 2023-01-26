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
        limit,
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
    public static overviewOverviewGet({
        bins = 20,
        filterParams = '',
    }: {
        bins?: number,
        filterParams?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/overview',
            query: {
                'bins': bins,
                'filter_params': filterParams,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Spider
     * @returns any Successful Response
     * @throws ApiError
     */
    public static spiderSpiderGet({
        start = '',
        end = '',
        filterParams = '',
    }: {
        start?: string,
        end?: string,
        filterParams?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/spider',
            query: {
                'start': start,
                'end': end,
                'filter_params': filterParams,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Overview Histogram
     * @returns any Successful Response
     * @throws ApiError
     */
    public static overviewHistogramOverviewHistogramGet({
        filterParams = '',
    }: {
        filterParams?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/overview-histogram',
            query: {
                'filter_params': filterParams,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}