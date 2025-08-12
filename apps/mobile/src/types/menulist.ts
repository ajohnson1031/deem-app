export enum MenuIconType {
  FEATHER = 'feather',
  FONT_AWESOME = 'fontawesome',
  FONT_AWESOME6 = 'fontawesome6',
  MATERIAL = 'material',
  MATERIAL_COMM = 'material_community',
  OCTICONS = 'octicons',
}

export interface MenuListItemProps {
  iconType: MenuIconType;
  iconName: any;
  iconSize?: number;
  labelText: string;
  helperText: string;
  chevronText?: string;
  hasBackground?: boolean;
  onPress: () => void;
}
