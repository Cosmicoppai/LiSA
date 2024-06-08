import argparse
import hrequests
import json
import requests
from urllib.parse import quote

if __name__ == "__main__":
    # url = "https://www.vrbo.com/graphql"
    #
    # payload = json.dumps({
    #     "operationName": "PropertyAvailabilityQuery",
    #     "variables": {
    #         "context": {
    #             "clientInfo": {
    #                 "name": "android.com.vrbo.android",
    #                 "version": "2023.45.0"
    #             },
    #             "currency": "USD",
    #             "device": {
    #                 "type": "APP_PHONE"
    #             },
    #             "eapid": 1,
    #             "locale": "en_US",
    #             "privacyTrackingState": "CAN_TRACK",
    #             "siteId": 9001001
    #         },
    #         "eid": "33656406"
    #     },
    #     "query": "query PropertyAvailabilityQuery($context: ContextInput!, $eid: ID!, $dateRange: DateRangeInput) { propertyAvailabilityCalendars(context: $context, eid: $eid, dateRange: $dateRange) { configuration { beginDate { __typename ...availabilityDate } endDate { __typename ...availabilityDate } availableByDefault defaultStayConstraints { stayIncrementInDays minimumStayInDays maximumStayInDays } defaultCheckinValidityAfterEndDate defaultCheckoutValidityWhenWithinConstraints } days { date { __typename ...availabilityDate } available stayConstraints { minimumStayInDays maximumStayInDays stayIncrementInDays } checkinValidity checkoutValidity } } }  fragment availabilityDate on Date { day month year }"
    # })
    # headers = {
    #     'User-Agent': 'Vrbo/2023.45.0 Dalvik/2.1.0 (Linux; U; Android 13; SM-G973F Build/QP1A.190711.020)',
    #     'Client-Info': 'android.com.vrbo.android,2023.45.0,external',
    #     'Content-Type': 'application/json',
    #     'Accept-Encoding': 'gzip, deflate, br',
    # }
    # # Define the proxy data
    # from urllib.parse import quote
    #
    # proxy_user = quote("support@pricelabs.co?country=us")
    # proxy_pass = quote("fCKUD1HRlu9i5sSgV6UxV7xAJjzclNJn8cgZj0bY")
    #
    # # Format the proxy URL
    # proxy_host = 'network.joinmassive.com'
    # proxy_port = 65534
    # proxy_url = f"http://{proxy_user}:{proxy_pass}@{proxy_host}:{proxy_port}"
    #
    # proxies = {'http': proxy_url, 'https': proxy_url}
    #
    # session = requests.Session()
    # session.proxies.update(proxies)
    #
    # response = hrequests.post(url, headers=headers, data=payload, proxies=proxies, allow_redirects=True)
    #
    # print(response.text)

    # import requests
    # import json
    #
    # url = "https://www.vrbo.com/auth/mfa/v1/shouldChallenge?site=VRBO"
    #
    # payload = json.dumps({
    #     "devices": [
    #         {
    #             "deviceId": "dd8adefa-20e3-4794-8bc1-5623f1d3350a",
    #             "type": "THREAT_METRIX"
    #         }
    #     ]
    # })
    # headers = {
    #     'User-Agent': 'okhttp/4.10.0',
    #     'x-homeaway-deviceid': 'd8adefa-20e3-4794-8bc1-5623f1d3350a',
    #     'x-homeaway-client': 'owner',
    #     'x-homeaway-thin-ui-site': 'HOMEAWAY_US',
    #     'cookie': 'HATGC_LOTC=tgt-56e45f1b-b334-4ca9-9c0a-9e4eeb46c268-production.homeaway.com-aws; site=HOMEAWAY_US; HASESSIONV3=bf9229a6-be53-43de-89ab-e775539a0a39;',
    #     'Content-Type': 'application/json'
    # }
    #
    # response = requests.request("POST", url, headers=headers, data=payload)
    #
    # print(response.text, response.status_code)

    import hrequests
    import json
    import time
    import uuid
    from urllib.parse import urlencode


    def availability_request(hotel_id):
        user_agent = "Vrbo/2024.9.1 Dalvik/2.1.0 (Linux; U; Android 9; ASUS_Z01QD Build/PQ3B.190801.12041624)"
        header = {
            'Client-Info': "android.com.vrbo.android,2024.9.1,external",
            'User-Agent': user_agent,
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'X-Apollo-Operation-Id': '6f5006dfb108326a160fa57e459e013a5d755732f9ca2f60afdb840e679b05f1',
            'X-Apollo-Operation-Name': 'PropertyAvailabilityQuery',
            'Device-User-Agent-Id': str(uuid.uuid4()),
            'X-Eb-Client': "PLATFORM:ANDROID;OS_VERSION:9;MANUFACTURER:asus;MODEL:ASUS_Z01QD;UPGRADE:false;APP_VERSION:2024.9.1;LOCALE:en_US;",
            'X-Mobvisid': str(uuid.uuid4()),
            'X-Date': time.strftime('%a, %d %b %Y %H:%M:%S GMT', time.gmtime())
        }

        query_variables = {
            'context': {
                'clientInfo': {
                    'name': 'android.com.vrbo.android',
                    'version': '2023.45.0'
                },
                'currency': 'USD',
                'device': {
                    'type': 'APP_PHONE'
                },
                'eapid': 1,
                'identity': {
                    'authState': 'ANONYMOUS',
                    'duaid': str(uuid.uuid4()),
                    'tuid': '-1'
                },
                'locale': 'en_US',
                'privacyTrackingState': 'CAN_TRACK',
                'siteId': 9001001
            },
            'eid': hotel_id
        }

        extensions = {
            'persistedQuery': {
                'version': 1,
                'sha256Hash': '6f5006dfb108326a160fa57e459e013a5d755732f9ca2f60afdb840e679b05f1'
            }
        }

        url_params = {
            'operationName': 'PropertyAvailabilityQuery',
            'variables': json.dumps(query_variables),
            'extensions': json.dumps(extensions)
        }

        url = f"https://www.vrbo.com/graphql?{urlencode(url_params)}"

        resp = hrequests.request("GET", url, headers=header)

        print(resp.status_code)


    availability_request(35739082)


