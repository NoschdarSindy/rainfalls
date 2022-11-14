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
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static detailDetailIdGet(
        id: number,
    ): CancelablePromise<any> {
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
     * Area
     * @param start
     * @param end
     * @returns any Successful Response
     * @throws ApiError
     */
    public static areaAreaGet(
        start: number = 1451606400000,
        end: number = 1483228799000,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/area',
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
     * Length
     * @param start
     * @param end
     * @returns any Successful Response
     * @throws ApiError
     */
    public static lengthLengthGet(
        start: number = 1451606400000,
        end: number = 1483228799000,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/length',
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
     * Severity
     * @param start
     * @param end
     * @returns any Successful Response
     * @throws ApiError
     */
    public static severitySeverityGet(
        start: number = 1451606400000,
        end: number = 1483228799000,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/severity',
            query: {
                'start': start,
                'end': end,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}