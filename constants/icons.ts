import { Home, Settings, Plus, Menu, List, AlertTriangle, Bell } from "lucide-react-native";

export const lucideIcons = {
    Home,
    Settings,
    Plus,
    Menu,
    List,
    AlertTriangle,
    Bell,
} as const;

import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import back from "@/assets/icons/back.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import dropbox from "@/assets/icons/dropbox.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import home from "@/assets/icons/home.png";
import medium from "@/assets/icons/medium.png";
import menu from "@/assets/icons/menu.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import plus from "@/assets/icons/plus.png";
import setting from "@/assets/icons/setting.png";
import spotify from "@/assets/icons/spotify.png";
import wallet from "@/assets/icons/wallet.png";

import app from "@/assets/icons/notifications/app.png";
import gmail from "@/assets/icons/notifications/gmail.png";
import sms from "@/assets/icons/notifications/sms.png";

export const icons = {
    home,
    wallet,
    setting,
    activity,
    add,
    back,
    menu,
    plus,
    notion,
    dropbox,
    openai,
    adobe,
    medium,
    figma,
    spotify,
    github,
    claude,
    canva,
    gmail,
    app,
    sms
} as const;

export type IconKey = keyof typeof icons;
