<script setup>
import { BxLeftIndent } from "@kalimahapps/vue-icons";
import { MdRoundScreenRotation } from "@kalimahapps/vue-icons";
import { AnOutlinedPushpin } from "@kalimahapps/vue-icons";
import { ChMenuMeatball } from "@kalimahapps/vue-icons";
import { CdDebugRestart } from "@kalimahapps/vue-icons";
import { PhAndroidLogo } from "@kalimahapps/vue-icons";
import { ByImport } from "@kalimahapps/vue-icons";
import { ByExport } from "@kalimahapps/vue-icons";
import { AkClipboard } from "@kalimahapps/vue-icons";
import { CaLoadBalancerClassic } from "@kalimahapps/vue-icons";
import { AkChevronRightSmall } from "@kalimahapps/vue-icons";
import { MdOutlinedSwipe } from '@kalimahapps/vue-icons';
import { FlSlideRecord } from '@kalimahapps/vue-icons';
import { AnOutlinedPlayCircle } from '@kalimahapps/vue-icons';
import { BxTask } from '@kalimahapps/vue-icons';
import { AnOutlinedClose } from '@kalimahapps/vue-icons';
import { CaKeyboard } from '@kalimahapps/vue-icons';
import { CaPhraseSentiment } from '@kalimahapps/vue-icons';
import { AnOutlinedRotateRight } from '@kalimahapps/vue-icons';
</script>

<template>
  <div class="flex flex-col gap-2 mx-1">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <span class="font-semibold text-[14px]">Functions</span>

      <div class="flex items-center gap-1">
        <BxLeftIndent class="w-4 h-4 cursor-pointer hover:text-gray-600" />
        <AnOutlinedRotateRight
          class="w-4 h-4 cursor-pointer hover:text-gray-600"
        />
        <AnOutlinedPushpin class="w-4 h-4 cursor-pointer hover:text-gray-600" />
        <ChMenuMeatball class="w-4 h-4 cursor-pointer hover:text-gray-600" />
      </div>
    </div>
    <!-- List function -->

    <div class="flex flex-col">
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <CdDebugRestart class="text-red-400" />
        <span>Restart</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <PhAndroidLogo />
        <span>Install APK</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <ByImport />
        <span>Import File</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <ByExport />
        <span>Export File</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <AkClipboard />
        <span>Export Clipboard</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer justify-between"
      >
        <div class="flex items-center gap-2">
          <CaLoadBalancerClassic />
          <span>ADB</span>
        </div>
        <AkChevronRightSmall />
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <MdOutlinedSwipe />
        <span>Auto Swipe</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <FlSlideRecord />
        <span>Action Record</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <AnOutlinedPlayCircle />
        <span>Execute Action</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <BxTask />
        <span>Execute Task</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer text-red-400"
      >
        <AnOutlinedClose />
        <span>End Task</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <CaKeyboard />
        <span>Switch input Method</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <CaPhraseSentiment />
        <span >Quick Phrase</span>
      </div>
      <div
        class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
      >
        <MdRoundScreenRotation />
        <span >Rotate Right</span>
      </div>
    </div>
  </div>
</template>
