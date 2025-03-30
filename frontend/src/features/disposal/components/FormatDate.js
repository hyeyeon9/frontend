import { format } from "date-fns";

export function FormatDate(dateString){
    if(!dateString) return "";
    return format(new Date(dateString), "yyyy년 M월 d일 a h시 mm분")
}