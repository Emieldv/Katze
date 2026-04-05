import { App as CapApp } from '@capacitor/app'
import { ArrowLeft } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LinkButton from '../../../components/LinkButton'
import SafeArea from '../../../components/SafeArea'
import TabBar from '../../../components/TabBar'
import TimerSettings from '../components/TimerSettings'
import AppListScreen from './AppListScreen'
import NfcCardManagerScreen from './NfcCardManagerScreen'

import type { useStorage } from '../../../hooks/useStorage'

type SettingsProps = {
  storage: ReturnType<typeof useStorage>
}

type Tab = 'whitelist' | 'nfc' | 'timer'

const tabs: { key: Tab; label: string }[] = [
  { key: 'whitelist', label: 'Apps' },
  { key: 'nfc', label: 'NFC Cards' },
  { key: 'timer', label: 'Timer' },
]

export default function Settings({ storage }: SettingsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('whitelist')
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    CapApp.getInfo().then(({ version, build }) => {
      setAppVersion(`v${version} (${build})`)
    })
  }, [])

  return (
    <SafeArea>
      <div className='px-6'>
        <LinkButton
          size='medium'
          text='Back'
          onClick={() => navigate('/')}
          className='mb-4 active:opacity-70'
          icon={<ArrowLeft className='w-4 h-4' />}
        />
        <h1 className='text-2xl font-bold text-primary-400 mb-6'>Settings</h1>

        <div className='mb-6'>
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      <div className='flex-1 px-6 pb-2 overflow-y-auto'>
        {activeTab === 'whitelist' && <AppListScreen whitelist={storage.whitelist} onSave={storage.saveWhitelist} />}
        {activeTab === 'nfc' && <NfcCardManagerScreen cards={storage.nfcCards} onSave={storage.saveNfcCards} />}
        {activeTab === 'timer' && <TimerSettings config={storage.timerConfig} onSave={storage.saveTimerConfig} />}
      </div>

      {appVersion && <p className='text-xs text-gray-600 text-center pb-4'>{appVersion}</p>}
    </SafeArea>
  )
}
