import { OnOff, ScryptedDeviceBase, Setting, Settings, SettingValue } from '@scrypted/sdk';

import AxiosDigestAuth from '@koush/axios-digest-auth';
import https from 'https';

class AmcrestCameraPrivacy extends ScryptedDeviceBase implements OnOff, Settings {
    endpoint = '/cgi-bin/configManager.cgi?action=setConfig&LeLensMask[0].Enable='
    digestAuth: AxiosDigestAuth;
    amcrestHttpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    async getSettings(): Promise<Setting[]> {
        return [
            {
                key: 'username',
                value: this.storage.getItem('username'),
                title: 'Username',
                description: 'The Amcrest Camera username.',
                type: 'string'
            },
            {
                key: 'password',
                value: this.storage.getItem('password'),
                title: 'Password',
                description: 'The Amcrest Camera password.',
                type: 'password'
            },
            {
                key: 'ip',
                value: this.storage.getItem('ip'),
                title: 'Camera IP',
                description: 'The IP address of the Amcrest Camera.',
                type: 'string'
            },
        ]
    }

    async putSetting(key: string, value: SettingValue): Promise<void> {
        this.storage.setItem(key, value.toString());
        this.rebuildAuth()
    }

    constructor(nativeId?: string) {
        super(nativeId);
        this.on = this.on || false;
        this.rebuildAuth()
    }

    rebuildAuth() {
        this.digestAuth = new AxiosDigestAuth({
            username: this.storage.getItem('username'), 
            password: this.storage.getItem('password'), 
        })
    }

    async setEnabled(enabled: boolean) {
        const ip = this.storage.getItem('ip')
        const enabledText = enabled ? 'true' : 'false'
        const url = `http://${ip}${this.endpoint}${enabledText}`

        const response = await this.digestAuth.request({
            httpsAgent: this.amcrestHttpsAgent,
            method: "GET",
            responseType: 'text',
            url: url,
        }).catch(error => {
            this.console.log((error))
        });

        this.console.log(response)
    }

    async turnOff() {
        this.console.log('turnOff');
        this.setEnabled(false)
        this.on = false;
    }

    async turnOn() {
        this.console.log('turnOn');
        this.setEnabled(true)
        this.on = true
    } 
}

export default AmcrestCameraPrivacy;
